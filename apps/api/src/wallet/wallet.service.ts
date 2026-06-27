import { ForbiddenException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalletService {
	constructor(private readonly prisma: PrismaService) {}

	// Resolve the buyer's wallet, creating it on first use.
	private getOrCreate(client: Prisma.TransactionClient, userId: string) {
		return client.wallet.upsert({
			where: { userId },
			update: {},
			create: { userId },
		});
	}

	// Current balance plus the most recent transactions.
	async getSummary(userId: string) {
		const wallet = await this.getOrCreate(this.prisma, userId);
		const transactions = await this.prisma.walletTransaction.findMany({
			where: { walletId: wallet.id },
			orderBy: { createdAt: "desc" },
			take: 50,
		});
		return { balance: wallet.balance, transactions };
	}

	// Dummy top-up of the buyer wallet.
	async topUp(userId: string, amount: number) {
		await this.prisma.$transaction(async (tx) => {
			const wallet = await this.getOrCreate(tx, userId);
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
		return this.getSummary(userId);
	}

	// Debit the buyer wallet and record a purchase.
	async debit(
		tx: Prisma.TransactionClient,
		userId: string,
		amount: number,
		meta: { description: string; orderId?: string },
	) {
		const wallet = await this.getOrCreate(tx, userId);
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

	// Credit the buyer wallet back.
	async refund(
		tx: Prisma.TransactionClient,
		userId: string,
		amount: number,
		meta: { description: string; orderId?: string },
	) {
		const wallet = await this.getOrCreate(tx, userId);
		const updated = await tx.wallet.update({
			where: { id: wallet.id },
			data: { balance: { increment: amount } },
			select: { id: true, balance: true },
		});
		return tx.walletTransaction.create({
			data: {
				walletId: updated.id,
				orderId: meta.orderId ?? null,
				type: "REFUND",
				amount,
				balanceAfter: updated.balance,
				description: meta.description,
			},
		});
	}
}
