import { z } from "zod";
import { roleSchema, nonAdminRoleSchema, userSchema } from "./user";

export const registerSchema = z
	.object({
		name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
		email: z.string().trim().toLowerCase().email("Invalid email address"),
		password: z
			.string()
			.min(8, "Password must be at least 8 characters")
			.max(128, "Password is too long"),
		roles: z.array(nonAdminRoleSchema).min(1, "Select at least one role"),
	})
	.strict();
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z
	.object({
		email: z.string().trim().toLowerCase().email("Invalid email address"),
		password: z.string().min(1, "Password is required"),
	})
	.strict();
export type LoginInput = z.infer<typeof loginSchema>;

export const setActiveRoleSchema = z
	.object({
		role: roleSchema,
	})
	.strict();
export type SetActiveRoleInput = z.infer<typeof setActiveRoleSchema>;

export const authResponseSchema = z.object({
	user: userSchema,
	accessToken: z.string(),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;
