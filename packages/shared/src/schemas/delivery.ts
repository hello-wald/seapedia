import { z } from "zod";
import { publicStoreSchema } from "./store";
import { deliveryMethodSchema } from "./checkout";

export const deliverySummarySchema = z.object({
	id: z.string(),
	orderId: z.string(),
	store: publicStoreSchema,
	deliveryMethod: deliveryMethodSchema,
	deliveryFee: z.number().int(),
	recipientName: z.string(),
	city: z.string(),
	province: z.string(),
	totalItems: z.number().int(),
	createdAt: z.string().datetime(),
});
export type DeliverySummary = z.infer<typeof deliverySummarySchema>;
