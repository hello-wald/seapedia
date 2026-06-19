import { z } from "zod";

export const productSchema = z.object({
	id: z.string(),
	name: z.string().min(1),
	price: z.number().int().nonnegative(),
	storeName: z.string().min(1),
	city: z.string().min(1),
	rating: z.number().min(0).max(5),
	sold: z.string(),
});
export type Product = z.infer<typeof productSchema>;

export const createProductSchema = productSchema.omit({ id: true });
export type CreateProductInput = z.infer<typeof createProductSchema>;
