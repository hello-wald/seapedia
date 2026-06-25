import { z } from "zod";
import { publicStoreSchema } from "./store";
import { deliveryMethodSchema } from "./checkout";
import { orderSchema, orderStatusSchema } from "./order";

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
	status: orderStatusSchema,
	completedAt: z.string().datetime().nullable(),
	createdAt: z.string().datetime(),
});
export type DeliverySummary = z.infer<typeof deliverySummarySchema>;

export const deliveryDetailSchema = orderSchema.extend({
	deliveryId: z.string(),
	driverId: z.string().nullable(),
	takenAt: z.string().datetime().nullable(),
	completedAt: z.string().datetime().nullable(),
});
export type DeliveryDetail = z.infer<typeof deliveryDetailSchema>;
