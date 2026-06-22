import type { AddToCartInput, CartSummary } from "@seapedia/shared";
import { deleteJson, getJson, putJson } from "./api";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

export function getCart(token: string) {
	return getJson<CartSummary>("/api/cart", token);
}

export function updateCartItem(
	token: string,
	itemId: string,
	quantity: number,
) {
	return putJson<CartSummary>(
		`/api/cart/items/${itemId}`,
		{ quantity },
		token,
	);
}

export function removeCartItem(token: string, itemId: string) {
	return deleteJson<CartSummary>(`/api/cart/items/${itemId}`, token);
}

export function clearCart(token: string) {
	return deleteJson<CartSummary>("/api/cart", token);
}

export type AddToCartResult =
	| { ok: true; data: CartSummary }
	| { ok: false; conflict: true; currentStoreName: string; message: string }
	| { ok: false; error: string };

export async function addToCart(
	token: string,
	input: AddToCartInput,
): Promise<AddToCartResult> {
	const res = await fetch(`${API_URL}/api/cart/items`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
		},
		body: JSON.stringify(input),
	});

	if (res.ok) {
		return { ok: true, data: (await res.json()) as CartSummary };
	}

	const body = (await res.json().catch(() => null)) as {
		message?: string | string[];
		conflict?: boolean;
		currentStoreName?: string;
	} | null;

	if (res.status === 409 && body?.conflict) {
		return {
			ok: false,
			conflict: true,
			currentStoreName: body.currentStoreName ?? "another store",
			message:
				typeof body.message === "string"
					? body.message
					: "Your cart contains items from another store.",
		};
	}

	const message = Array.isArray(body?.message)
		? body.message.join(", ")
		: (body?.message ?? res.statusText);
	return { ok: false, error: message };
}
