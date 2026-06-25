import { ForbiddenException, Injectable } from "@nestjs/common";
import { Prisma, type WalletType } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalletService {
	constructor(private readonly prisma: PrismaService) {}

	// Resolve (userId, type) wallet, creating it on first use.
	private getOrCreate(
		client: Prisma.TransactionClient,
		userId: string,
		type: WalletType,
	) {
		return client.wallet.upsert({
			where: { userId_type: { userId, type } },
			update: {},
			create: { userId, type },
		});
	}

	// Current balance plus the most recent transactions.
	async getSummary(userId: string, type: WalletType = "BUYER") {
		const wallet = await this.getOrCreate(this.prisma, userId, type);
		const transactions = await this.prisma.walletTransaction.findMany({
			where: { walletId: wallet.id },
			orderBy: { createdAt: "desc" },
			take: 50,
		});
		return { balance: wallet.balance, transactions };
	}

	// Dummy top-up of buyer wallet.
	async topUp(userId: string, amount: number) {
		await this.prisma.$transaction(async (tx) => {
			const wallet = await this.getOrCreate(tx, userId, "BUYER");
			const updated = await tx.wallet.update({
				where: { id: wallet.id },
				data: { balance: { increment: amount } },
				select: { id: true, balance: true },
			});
			await tx.walletTransaction.create({
				data: {
					walletId: updated.id,
					type: "TOPUP",
					amount,
					balanceAfter: updated.balance,
					description: "Wallet top-up",
				},
			});
		});
		return this.getSummary(userId, "BUYER");
	}

	// Debit the buyer wallet and record a purchase.
	async debit(
		tx: Prisma.TransactionClient,
		userId: string,
		amount: number,
		meta: { description: string; orderId?: string },
	) {
		const wallet = await this.getOrCreate(tx, userId, "BUYER");
		const res = await tx.wallet.updateMany({
			where: { id: wallet.id, balance: { gte: amount } },
			data: { balance: { decrement: amount } },
		});
		if (res.count === 0) {
			throw new ForbiddenException("Insufficient balance");
		}

		const updated = await tx.wallet.findUniqueOrThrow({
			where: { id: wallet.id },
			select: { balance: true },
		});
		return tx.walletTransaction.create({
			data: {
				walletId: wallet.id,
				orderId: meta.orderId ?? null,
				type: "PURCHASE",
				amount: -amount,
				balanceAfter: updated.balance,
				description: meta.description,
			},
		});
	}
}
