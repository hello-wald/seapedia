import { z } from "zod";

export const deliveryMethodSchema = z.enum(["INSTANT", "NEXT_DAY", "REGULAR"]);
export type DeliveryMethod = z.infer<typeof deliveryMethodSchema>;

export const DELIVERY_METHOD_LABELS: Record<DeliveryMethod, string> = {
	INSTANT: "Instant",
	NEXT_DAY: "Next Day",
	REGULAR: "Regular",
};

export const DELIVERY_FEES: Record<DeliveryMethod, number> = {
	INSTANT: 30000,
	NEXT_DAY: 15000,
	REGULAR: 10000,
};

export const SLA_DAYS: Record<DeliveryMethod, number> = {
	INSTANT: 0,
	NEXT_DAY: 1,
	REGULAR: 3,
};

export function orderDeadline(
	createdAt: Date | string,
	method: DeliveryMethod,
): Date {
	const d = new Date(createdAt);
	d.setHours(23, 59, 59, 999);
	d.setDate(d.getDate() + SLA_DAYS[method]);
	return d;
}

export const PPN_RATE = 0.12;

export interface OrderTotals {
	subtotal: number;
	discount: number;
	deliveryFee: number;
	tax: number;
	total: number;
}

export function computeOrderTotals(
	subtotal: number,
	method: DeliveryMethod,
	discount = 0,
): OrderTotals {
	const deliveryFee = DELIVERY_FEES[method];
	const taxable = subtotal - discount;
	const tax = Math.round(taxable * PPN_RATE);
	const total = taxable + deliveryFee + tax;
	return { subtotal, discount, deliveryFee, tax, total };
}

export const checkoutSchema = z
	.object({
		addressId: z.string().min(1, "Please select a delivery address"),
		deliveryMethod: deliveryMethodSchema,
		discountCode: z
			.string()
			.trim()
			.optional()
			.transform((c) => (c ? c.toUpperCase() : undefined)),
	})
	.strict();
export type CheckoutInput = z.infer<typeof checkoutSchema>;
