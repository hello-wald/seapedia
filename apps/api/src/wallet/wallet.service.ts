import { ForbiddenException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalletService {
	constructor(private readonly prisma: PrismaService) {}

	// Current balance plus the most recent transactions.
	async getSummary(userId: string) {
		const [user, transactions] = await Promise.all([
			this.prisma.user.findUniqueOrThrow({
				where: { id: userId },
				select: { balance: true },
			}),
			this.prisma.walletTransaction.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
				take: 50,
			}),
		]);
		return { balance: user.balance, transactions };
	}

	// Dummy top-up
	async topUp(userId: string, amount: number) {
		await this.prisma.$transaction(async (tx) => {
			const user = await tx.user.update({
				where: { id: userId },
				data: { balance: { increment: amount } },
				select: { balance: true },
			});
			await tx.walletTransaction.create({
				data: {
					userId,
					type: "TOPUP",
					amount,
					balanceAfter: user.balance,
					description: "Wallet top-up",
				},
			});
		});
		return this.getSummary(userId);
	}

	// Debit the wallet and record a transaction.
	async debit(
		tx: Prisma.TransactionClient,
		userId: string,
		amount: number,
		meta: { description: string; orderId?: string },
	) {
		const res = await tx.user.updateMany({
			where: { id: userId, balance: { gte: amount } },
			data: { balance: { decrement: amount } },
		});
		if (res.count === 0) {
			throw new ForbiddenException("Insufficient balance");
		}

		const user = await tx.user.findUniqueOrThrow({
			where: { id: userId },
			select: { balance: true },
		});
		return tx.walletTransaction.create({
			data: {
				userId,
				orderId: meta.orderId ?? null,
				type: "PURCHASE",
				amount: -amount,
				balanceAfter: user.balance,
				description: meta.description,
			},
		});
	}
}
