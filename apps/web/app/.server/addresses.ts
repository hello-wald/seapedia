import type { Address, SaveAddressInput } from "@seapedia/shared";
import { deleteJson, getJson, postJson, putJson } from "./api";

export function getAddresses(token: string) {
	return getJson<Address[]>("/api/addresses", token);
}

export function createAddress(token: string, input: SaveAddressInput) {
	return postJson<Address>("/api/addresses", input, token);
}

export function updateAddress(
	token: string,
	id: string,
	input: SaveAddressInput,
) {
	return putJson<Address>(`/api/addresses/${id}`, input, token);
}

export function deleteAddress(token: string, id: string) {
	return deleteJson<{ id: string }>(`/api/addresses/${id}`, token);
}
