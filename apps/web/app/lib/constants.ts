import type { Role } from "@seapedia/shared";

export const ROLE_LABEL: Record<Role, string> = {
	ADMIN: "Admin",
	BUYER: "Buyer",
	DRIVER: "Driver",
	SELLER: "Seller",
};

export const SUCCESS_MESSAGE = {
	product: {
		create: "Product created successfully",
		update: "Changes saved successfully",
		delete: "Product deleted successfully",
	},
	store: {
		create: "Store created successfully",
		update: "Changes saved successfully",
	},
} as const;
