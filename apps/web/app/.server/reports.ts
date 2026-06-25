import type {
	BalanceSummary,
	BuyerSpendingReport,
	SellerIncomeReport,
} from "@seapedia/shared";
import { getJson } from "./api";

export function getBuyerReport(token: string) {
	return getJson<BuyerSpendingReport>("/api/orders/report", token);
}

export function getSellerReport(token: string) {
	return getJson<SellerIncomeReport>("/api/orders/incoming/report", token);
}

export function getBalance(token: string) {
	return getJson<BalanceSummary>("/api/orders/balance", token);
}
