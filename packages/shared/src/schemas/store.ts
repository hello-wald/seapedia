import { z } from "zod";

export const createStoreSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Store name is required")
			.max(60, "Store name is too long"),
		description: z
			.string()
			.trim()
			.max(280, "Description is too long")
			.optional(),
	})
	.strict();
export type CreateStoreInput = z.infer<typeof createStoreSchema>;

export const updateStoreSchema = createStoreSchema;
export type UpdateStoreInput = z.infer<typeof updateStoreSchema>;

export const storeSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string().nullable(),
	sellerId: z.string(),
	createdAt: z.string().datetime(),
});
export type Store = z.infer<typeof storeSchema>;

export const publicStoreSchema = storeSchema.pick({
	id: true,
	name: true,
	description: true,
});
export type PublicStore = z.infer<typeof publicStoreSchema>;
