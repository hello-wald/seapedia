import type { WalletSummary } from "@seapedia/shared";
import { getJson, postJson } from "./api";

export function getWallet(token: string) {
	return getJson<WalletSummary>("/api/wallet", token);
}

export function topUpWallet(token: string, amount: number) {
	return postJson<WalletSummary>("/api/wallet/topup", { amount }, token);
}
