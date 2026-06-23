import type { CheckoutInput, Order, OrderSummary } from "@seapedia/shared";
import { getJson, postJson } from "./api";

export function getOrders(token: string) {
	return getJson<OrderSummary[]>("/api/orders", token);
}

export function getOrder(token: string, id: string) {
	return getJson<Order>(`/api/orders/${id}`, token);
}

export function getIncomingOrders(token: string) {
	return getJson<OrderSummary[]>("/api/orders/incoming", token);
}

export function checkout(token: string, input: CheckoutInput) {
	return postJson<Order>("/api/orders/checkout", input, token);
}
