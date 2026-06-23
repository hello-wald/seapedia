import { z } from "zod";
import { publicStoreSchema } from "./store";
import { deliveryMethodSchema } from "./checkout";

export const orderStatusSchema = z.enum([
	"SEDANG_DIKEMAS",
	"DIKIRIM",
	"SELESAI",
	"DIBATALKAN",
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
	SEDANG_DIKEMAS: "Sedang Dikemas",
	DIKIRIM: "Dikirim",
	SELESAI: "Selesai",
	DIBATALKAN: "Dibatalkan",
};

export const orderItemSchema = z.object({
	id: z.string(),
	productId: z.string().nullable(),
	name: z.string(),
	unitPrice: z.number().int(),
	quantity: z.number().int(),
	lineTotal: z.number().int(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderStatusHistorySchema = z.object({
	id: z.string(),
	status: orderStatusSchema,
	createdAt: z.string().datetime(),
});
export type OrderStatusHistory = z.infer<typeof orderStatusHistorySchema>;

export const orderSchema = z.object({
	id: z.string(),
	status: orderStatusSchema,
	deliveryMethod: deliveryMethodSchema,
	subtotal: z.number().int(),
	deliveryFee: z.number().int(),
	tax: z.number().int(),
	total: z.number().int(),
	recipientName: z.string(),
	phone: z.string(),
	addressLine1: z.string(),
	city: z.string(),
	province: z.string(),
	postalCode: z.string(),
	store: publicStoreSchema,
	buyerName: z.string(),
	items: z.array(orderItemSchema),
	statusHistory: z.array(orderStatusHistorySchema),
	createdAt: z.string().datetime(),
});
export type Order = z.infer<typeof orderSchema>;

export const orderSummarySchema = z.object({
	id: z.string(),
	status: orderStatusSchema,
	deliveryMethod: deliveryMethodSchema,
	total: z.number().int(),
	totalItems: z.number().int(),
	store: publicStoreSchema,
	buyerName: z.string(),
	createdAt: z.string().datetime(),
});
export type OrderSummary = z.infer<typeof orderSummarySchema>;
