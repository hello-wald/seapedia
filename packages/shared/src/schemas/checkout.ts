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

export const PPN_RATE = 0.12;

export interface OrderTotals {
	subtotal: number;
	deliveryFee: number;
	tax: number;
	total: number;
}

export function computeOrderTotals(
	subtotal: number,
	method: DeliveryMethod,
): OrderTotals {
	const deliveryFee = DELIVERY_FEES[method];
	const tax = Math.round(subtotal * PPN_RATE);
	const total = subtotal + deliveryFee + tax;
	return { subtotal, deliveryFee, tax, total };
}

export const checkoutSchema = z.object({
	addressId: z.string().min(1, "Please select a delivery address"),
	deliveryMethod: deliveryMethodSchema,
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;
