import { z } from "zod";

export const discountKindSchema = z.enum(["VOUCHER", "PROMO"]);
export type DiscountKind = z.infer<typeof discountKindSchema>;

export const DISCOUNT_KIND_LABELS: Record<DiscountKind, string> = {
	VOUCHER: "Voucher",
	PROMO: "Promo",
};

const codeSchema = z
	.string()
	.trim()
	.min(1, "Code is required")
	.max(40, "Code is too long")
	.transform((s) => s.toUpperCase());

const percentSchema = z.coerce
	.number()
	.int()
	.min(1, "Percent must be at least 1")
	.max(100, "Percent cannot exceed 100");

export const createVoucherSchema = z.object({
	code: codeSchema,
	percent: percentSchema,
	expiresAt: z.coerce.date(),
	usageLimit: z.coerce
		.number()
		.int()
		.min(1, "Usage limit must be at least 1"),
});
export type CreateVoucherInput = z.infer<typeof createVoucherSchema>;

export const createPromoSchema = z.object({
	code: codeSchema,
	percent: percentSchema,
	expiresAt: z.coerce.date(),
});
export type CreatePromoInput = z.infer<typeof createPromoSchema>;

export const voucherSchema = z.object({
	id: z.string(),
	code: z.string(),
	percent: z.number().int(),
	expiresAt: z.string().datetime(),
	usageLimit: z.number().int(),
	usedCount: z.number().int(),
	isActive: z.boolean(),
	createdAt: z.string().datetime(),
});
export type Voucher = z.infer<typeof voucherSchema>;

export const promoSchema = z.object({
	id: z.string(),
	code: z.string(),
	percent: z.number().int(),
	expiresAt: z.string().datetime(),
	isActive: z.boolean(),
	createdAt: z.string().datetime(),
});
export type Promo = z.infer<typeof promoSchema>;

export const availableDiscountSchema = z.object({
	kind: discountKindSchema,
	code: z.string(),
	percent: z.number().int(),
	expiresAt: z.string().datetime(),
	remaining: z.number().int().nullable(),
});
export type AvailableDiscount = z.infer<typeof availableDiscountSchema>;

export const discountResolutionSchema = z.object({
	kind: discountKindSchema,
	code: z.string(),
	percent: z.number().int(),
});
export type DiscountResolution = z.infer<typeof discountResolutionSchema>;

export function computeDiscount(subtotal: number, percent: number): number {
	return Math.round((subtotal * percent) / 100);
}
