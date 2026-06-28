import { z } from "zod";

export const topUpSchema = z
	.object({
		amount: z.coerce
			.number()
			.int()
			.positive("Amount must be greater than 0")
			.min(10000, "Minimum top-up is Rp 10.000")
			.max(10000000, "Maximum top-up is Rp 10.000.000"),
	})
	.strict();
export type TopUpInput = z.infer<typeof topUpSchema>;

export const walletTransactionTypeSchema = z.enum([
	"TOPUP",
	"PURCHASE",
	"REFUND",
]);
export type WalletTransactionType = z.infer<typeof walletTransactionTypeSchema>;

export const walletTransactionSchema = z.object({
	id: z.string(),
	type: walletTransactionTypeSchema,
	amount: z.number().int(),
	balanceAfter: z.number().int(),
	description: z.string().nullable(),
	createdAt: z.string().datetime(),
});
export type WalletTransaction = z.infer<typeof walletTransactionSchema>;

export const walletSummarySchema = z.object({
	balance: z.number().int(),
	transactions: z.array(walletTransactionSchema),
});
export type WalletSummary = z.infer<typeof walletSummarySchema>;
