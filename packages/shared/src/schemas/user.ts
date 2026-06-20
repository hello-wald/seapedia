import { z } from "zod";

export const roleSchema = z.enum(["ADMIN", "SELLER", "BUYER", "DRIVER"]);
export type Role = z.infer<typeof roleSchema>;

// Roles a user may register
export const nonAdminRoleSchema = z.enum(["SELLER", "BUYER", "DRIVER"]);
export type NonAdminRole = z.infer<typeof nonAdminRoleSchema>;

// Public user shape
export const userSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
	roles: z.array(roleSchema),
	// Null until a multi-role user chooses
	activeRole: roleSchema.nullable(),
	createdAt: z.string().datetime(),
});
export type User = z.infer<typeof userSchema>;
