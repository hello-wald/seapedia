import type { AvailableDiscount } from "@seapedia/shared";
import { getJson } from "./api";

export function getAvailableDiscounts(token: string) {
	return getJson<AvailableDiscount[]>("/api/discounts/available", token);
}
