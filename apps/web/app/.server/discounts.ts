import type {
	AvailableDiscount,
	CreatePromoInput,
	CreateVoucherInput,
	Promo,
	Voucher,
} from "@seapedia/shared";
import { getJson, postJson } from "./api";

export function getAvailableDiscounts(token: string) {
	return getJson<AvailableDiscount[]>("/api/discounts/available", token);
}

export function getAdminVouchers(token: string) {
	return getJson<Voucher[]>("/api/discounts/vouchers", token);
}

export function getAdminPromos(token: string) {
	return getJson<Promo[]>("/api/discounts/promos", token);
}

export function createVoucher(token: string, input: CreateVoucherInput) {
	return postJson<Voucher>("/api/discounts/vouchers", input, token);
}

export function createPromo(token: string, input: CreatePromoInput) {
	return postJson<Promo>("/api/discounts/promos", input, token);
}
