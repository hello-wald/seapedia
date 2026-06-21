import type { CreateProductInput, Product } from "@seapedia/shared";
import { deleteJson, getJson, postJson, putJson } from "./api";

export function getMyProducts(token: string) {
	return getJson<Product[]>("/api/products/me", token);
}

export function createProduct(token: string, input: CreateProductInput) {
	return postJson<Product>("/api/products", input, token);
}

export function updateProduct(
	token: string,
	id: string,
	input: CreateProductInput,
) {
	return putJson<Product>(`/api/products/${id}`, input, token);
}

export function deleteProduct(token: string, id: string) {
	return deleteJson<{ id: string }>(`/api/products/${id}`, token);
}
