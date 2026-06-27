import type {
	AdminDeliveryRow,
	AdminOverview,
	AdminProductRow,
	AdminStoreRow,
	AdminUserRow,
	OrderSummary,
} from "@seapedia/shared";
import { getJson } from "./api";

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
