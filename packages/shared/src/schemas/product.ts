import { z } from "zod";

export const createProductSchema = z.object({
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
	price: z.coerce.number().int().positive("Price must be greater than 0"),
	stock: z.coerce.number().int().nonnegative("Stock cannot be negative"),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const productSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	price: z.number().int(),
	stock: z.number().int(),
	storeId: z.string(),
	createdAt: z.string().datetime(),
});
export type Product = z.infer<typeof productSchema>;
