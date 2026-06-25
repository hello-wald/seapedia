import type { DeliveryDetail, DeliverySummary } from "@seapedia/shared";
import { getJson, postJson } from "./api";

export function getAvailableJobs(token: string) {
	return getJson<DeliverySummary[]>("/api/delivery", token);
}

export function getMyJobs(token: string) {
	return getJson<DeliverySummary[]>("/api/delivery/mine", token);
}

export function getDeliveryDetail(token: string, id: string) {
	return getJson<DeliveryDetail>(`/api/delivery/${id}`, token);
}

export function takeJob(token: string, id: string) {
	return postJson<DeliveryDetail>(`/api/delivery/${id}/take`, {}, token);
}

export function completeJob(token: string, id: string) {
	return postJson<DeliveryDetail>(`/api/delivery/${id}/complete`, {}, token);
}
