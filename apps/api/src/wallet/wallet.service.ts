import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class WalletService {
	constructor(private readonly prisma: PrismaService) {}

	// Current balance plus the most recent transactions.
	async getSummary(userId: string) {
		const wallet = await this.prisma.wallet.findUnique({
			where: { userId },
			include: {
				transactions: { orderBy: { createdAt: "desc" }, take: 50 },
			},
		});
		return {
			balance: wallet?.balance ?? 0,
			transactions: wallet?.transactions ?? [],
		};
	}

	// Dummy top-up
	async topUp(userId: string, amount: number) {
		await this.prisma.$transaction(async (tx) => {
			const wallet = await tx.wallet.upsert({
				where: { userId },
				update: { balance: { increment: amount } },
				create: { userId, balance: amount },
			});
			await tx.walletTransaction.create({
				data: {
					walletId: wallet.id,
					type: "TOPUP",
					amount,
					balanceAfter: wallet.balance,
					description: "Wallet top-up",
				},
			});
		});
		return this.getSummary(userId);
	}

	// Reserved for the checkout flow (L4): debit the wallet, rejecting when the
	// balance is insufficient, and record a PURCHASE transaction atomically.
	async debit(userId: string, amount: number, description: string) {
		return this.prisma.$transaction(async (tx) => {
			const wallet = await tx.wallet.upsert({
				where: { userId },
				update: {},
				create: { userId },
			});
			if (wallet.balance < amount) {
				throw new ForbiddenException("Insufficient balance");
			}
			const updated = await tx.wallet.update({
				where: { id: wallet.id },
				data: { balance: { decrement: amount } },
			});
			return tx.walletTransaction.create({
				data: {
					walletId: wallet.id,
					type: "PURCHASE",
					amount: -amount,
					balanceAfter: updated.balance,
					description,
				},
			});
		});
	}
}
