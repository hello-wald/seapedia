import type { DeliveryDetail, DeliverySummary } from "@seapedia/shared";
import { getJson } from "./api";

export function getAvailableJobs(token: string) {
	return getJson<DeliverySummary[]>("/api/delivery", token);
}

export function getDeliveryDetail(token: string, id: string) {
	return getJson<DeliveryDetail>(`/api/delivery/${id}`, token);
}
