import { z } from "zod";
import { publicStoreSchema } from "./store";

export const createProductSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Product name is required")
			.max(120, "Product name is too long"),
		description: z
			.string()
			.trim()
			.max(2000, "Description is too long")
			.optional(),
		price: z
			.coerce.number()
			.int()
			.positive("Price must be greater than 0")
			.max(1_000_000_000, "Price is too large"),
		stock: z
			.coerce.number()
			.int()
			.nonnegative("Stock cannot be negative")
			.max(1_000_000, "Stock is too large"),
		imageUrl: z.string().url("Image URL is invalid").optional(),
	})
	.strict();
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	price: z.number().int(),
	stock: z.number().int(),
	imageUrl: z.string().nullable(),
	storeId: z.string(),
	createdAt: z.string().datetime(),
});
export type Product = z.infer<typeof productSchema>;

export const catalogProductSchema = productSchema.extend({
	store: publicStoreSchema,
});
export type CatalogProduct = z.infer<typeof catalogProductSchema>;
