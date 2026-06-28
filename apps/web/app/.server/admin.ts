import type {
	AdminDeliveryRow,
	AdminOverview,
	AdminProductRow,
	AdminStoreRow,
	AdminUserRow,
	OrderSummary,
	OverduePage,
	OverdueRunResult,
	SystemClock,
} from "@seapedia/shared";
import { getJson, postJson } from "./api";

export function getAdminOverview(token: string) {
	return getJson<AdminOverview>("/api/admin/overview", token);
}

export function getAdminUsers(token: string) {
	return getJson<AdminUserRow[]>("/api/admin/users", token);
}

export function getAdminStores(token: string) {
	return getJson<AdminStoreRow[]>("/api/admin/stores", token);
}

export function getAdminProducts(token: string) {
	return getJson<AdminProductRow[]>("/api/admin/products", token);
}

export function getAdminOrders(token: string) {
	return getJson<OrderSummary[]>("/api/admin/orders", token);
}

export function getAdminDeliveries(token: string) {
	return getJson<AdminDeliveryRow[]>("/api/admin/deliveries", token);
}

export function getOverduePage(token: string) {
	return getJson<OverduePage>("/api/admin/overdue", token);
}

export function runOverdue(token: string) {
	return postJson<OverdueRunResult>("/api/admin/overdue/run", {}, token);
}

export function advanceClock(token: string, days: number) {
	return postJson<SystemClock>("/api/admin/clock/advance", { days }, token);
}

export function resetClock(token: string) {
	return postJson<SystemClock>("/api/admin/clock/reset", {}, token);
}
