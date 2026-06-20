import type { Role } from "@seapedia/shared";

export interface JwtPayload {
	sub: string;
	email: string;
	roles: Role[];
	activeRole: Role | null;
}
