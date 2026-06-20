import type { CreateStoreInput, Store } from "@seapedia/shared";
import { getJson, putJson } from "./api";

export function getMyStore(token: string) {
	return getJson<Store>("/api/stores/me", token);
}

export function saveStore(token: string, input: CreateStoreInput) {
	return putJson<Store>("/api/stores/me", input, token);
}
