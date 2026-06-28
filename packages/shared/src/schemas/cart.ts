import { z } from "zod";
import { publicStoreSchema } from "./store";

export const addToCartSchema = z
	.object({
		productId: z.string().min(1, "Product is required"),
		quantity: z.coerce
			.number()
			.int()
			.positive("Quantity must be at least 1")
			.max(999, "Quantity is too large")
			.default(1),
		replace: z.boolean().optional(),
	})
	.strict();
export type AddToCartInput = z.infer<typeof addToCartSchema>;

export const updateCartItemSchema = z
	.object({
		quantity: z.coerce
			.number()
			.int()
			.positive("Quantity must be at least 1")
			.max(999, "Quantity is too large"),
	})
	.strict();
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

export const cartItemSchema = z.object({
	id: z.string(),
	productId: z.string(),
	name: z.string(),
	price: z.number().int(),
	imageUrl: z.string().nullable(),
	stock: z.number().int(),
	quantity: z.number().int(),
	lineTotal: z.number().int(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSummarySchema = z.object({
	store: publicStoreSchema.nullable(),
	items: z.array(cartItemSchema),
	subtotal: z.number().int(),
	totalItems: z.number().int(),
});
export type CartSummary = z.infer<typeof cartSummarySchema>;
