import { z } from "zod";
import { roleSchema } from "./user";

export const buyerSpendingReportSchema = z.object({
	totalSpent: z.number().int(),
	ordersPlaced: z.number().int(),
	itemsBought: z.number().int(),
	totalSaved: z.number().int(),
});
export type BuyerSpendingReport = z.infer<typeof buyerSpendingReportSchema>;

export const sellerIncomeReportSchema = z.object({
	receivedIncome: z.number().int(),
	pendingIncome: z.number().int(),
	completedOrders: z.number().int(),
	itemsSold: z.number().int(),
});
export type SellerIncomeReport = z.infer<typeof sellerIncomeReportSchema>;

export const balanceSummarySchema = z.object({
	activeRole: roleSchema.nullable(),
	wallet: z.object({ balance: z.number().int().nullable() }).nullable(),
	sellerIncome: z.object({ total: z.number().int().nullable() }).nullable(),
	driverEarnings: z.object({ total: z.number().int().nullable() }).nullable(),
});
export type BalanceSummary = z.infer<typeof balanceSummarySchema>;
