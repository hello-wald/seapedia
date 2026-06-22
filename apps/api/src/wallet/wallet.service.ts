import { ForbiddenException, Injectable } from "@nestjs/common";
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

	// Debit the wallet, rejecting when the balance is insufficient, and record a PURCHASE transaction atomically.
	async debit(userId: string, amount: number, description: string) {
		return this.prisma.$transaction(async (tx) => {
			const current = await tx.user.findUniqueOrThrow({
				where: { id: userId },
				select: { balance: true },
			});
			if (current.balance < amount) {
				throw new ForbiddenException("Insufficient balance");
			}
			const user = await tx.user.update({
				where: { id: userId },
				data: { balance: { decrement: amount } },
				select: { balance: true },
			});
			return tx.walletTransaction.create({
				data: {
					userId,
					type: "PURCHASE",
					amount: -amount,
					balanceAfter: user.balance,
					description,
				},
			});
		});
	}
}
