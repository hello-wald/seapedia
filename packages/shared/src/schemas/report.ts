import { z } from "zod";

export const buyerSpendingReportSchema = z.object({
	totalSpent: z.number().int(),
	ordersPlaced: z.number().int(),
	itemsBought: z.number().int(),
	totalSaved: z.number().int(),
});
export type BuyerSpendingReport = z.infer<typeof buyerSpendingReportSchema>;

export const sellerIncomeReportSchema = z.object({
	completedIncome: z.number().int(),
	pendingIncome: z.number().int(),
	completedOrders: z.number().int(),
	itemsSold: z.number().int(),
});
export type SellerIncomeReport = z.infer<typeof sellerIncomeReportSchema>;
