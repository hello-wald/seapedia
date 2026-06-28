import { z } from "zod";
import { roleSchema } from "./user";
import { orderStatusSchema, orderSummarySchema } from "./order";
import { deliveryMethodSchema } from "./checkout";

export const adminOverviewSchema = z.object({
	users: z.object({
		total: z.number().int(),
		buyers: z.number().int(),
		sellers: z.number().int(),
		drivers: z.number().int(),
	}),
	stores: z.object({ total: z.number().int() }),
	products: z.object({
		total: z.number().int(),
		outOfStock: z.number().int(),
	}),
	orders: z.object({
		total: z.number().int(),
		sedangDikemas: z.number().int(),
		menungguPengirim: z.number().int(),
		dikirim: z.number().int(),
		selesai: z.number().int(),
		dikembalikan: z.number().int(),
		gmv: z.number().int(),
	}),
	deliveries: z.object({
		available: z.number().int(),
		inTransit: z.number().int(),
		delivered: z.number().int(),
	}),
	discounts: z.object({
		activeVouchers: z.number().int(),
		activePromos: z.number().int(),
	}),
});
export type AdminOverview = z.infer<typeof adminOverviewSchema>;

export const adminUserRowSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	roles: z.array(roleSchema),
	createdAt: z.string().datetime(),
});
export type AdminUserRow = z.infer<typeof adminUserRowSchema>;

export const adminStoreRowSchema = z.object({
	id: z.string(),
	name: z.string(),
	ownerName: z.string(),
	productCount: z.number().int(),
	orderCount: z.number().int(),
	createdAt: z.string().datetime(),
});
export type AdminStoreRow = z.infer<typeof adminStoreRowSchema>;

export const adminProductRowSchema = z.object({
	id: z.string(),
	name: z.string(),
	price: z.number().int(),
	stock: z.number().int(),
	storeName: z.string(),
});
export type AdminProductRow = z.infer<typeof adminProductRowSchema>;

export const adminDeliveryRowSchema = z.object({
	id: z.string(),
	orderId: z.string(),
	driverName: z.string().nullable(),
	status: orderStatusSchema,
	deliveryMethod: deliveryMethodSchema,
	deliveryFee: z.number().int(),
	takenAt: z.string().datetime().nullable(),
	completedAt: z.string().datetime().nullable(),
});
export type AdminDeliveryRow = z.infer<typeof adminDeliveryRowSchema>;

export const systemClockSchema = z.object({
	offsetDays: z.number().int(),
	now: z.string().datetime(), // effective "now" = realNow + offsetDays
});
export type SystemClock = z.infer<typeof systemClockSchema>;

export const overduePageSchema = z.object({
	clock: systemClockSchema,
	overdue: z.array(orderSummarySchema), // non-terminal orders past their SLA deadline
	returned: z.array(orderSummarySchema), // already-handled DIKEMBALIKAN orders
});
export type OverduePage = z.infer<typeof overduePageSchema>;

export const overdueRunResultSchema = z.object({
	processed: z.number().int(),
	refundedTotal: z.number().int(),
	orderIds: z.array(z.string()),
});
export type OverdueRunResult = z.infer<typeof overdueRunResultSchema>;

export const advanceClockSchema = z
	.object({
		days: z.coerce.number().int().min(1).max(365).default(1),
	})
	.strict();
export type AdvanceClockInput = z.infer<typeof advanceClockSchema>;
