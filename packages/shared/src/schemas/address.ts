import { z } from "zod";

export const saveAddressSchema = z
	.object({
		label: z
			.string()
			.trim()
			.min(1, "Label is required")
			.max(60, "Label is too long"),
		recipientName: z
			.string()
			.trim()
			.min(1, "Recipient name is required")
			.max(120, "Recipient name is too long"),
		phone: z
			.string()
			.trim()
			.min(1, "Phone is required")
			.regex(
				/^[0-9+\-\s()]{7,20}$/,
				"Enter a valid phone number",
			),
		line1: z
			.string()
			.trim()
			.min(1, "Address is required")
			.max(255, "Address is too long"),
		city: z
			.string()
			.trim()
			.min(1, "City is required")
			.max(100, "City is too long"),
		province: z
			.string()
			.trim()
			.min(1, "Province is required")
			.max(100, "Province is too long"),
		postalCode: z
			.string()
			.trim()
			.regex(/^\d{5}$/, "Postal code must be 5 digits"),
		isDefault: z.coerce.boolean().optional(),
	})
	.strict();
export type SaveAddressInput = z.infer<typeof saveAddressSchema>;

export const addressSchema = z.object({
	id: z.string(),
	userId: z.string(),
	label: z.string(),
	recipientName: z.string(),
	phone: z.string(),
	line1: z.string(),
	city: z.string(),
	province: z.string(),
	postalCode: z.string(),
	isDefault: z.boolean(),
	createdAt: z.string().datetime(),
});
export type Address = z.infer<typeof addressSchema>;
