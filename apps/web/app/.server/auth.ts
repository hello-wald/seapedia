import { redirect } from "react-router";
import type {
	AuthResponse,
	LoginInput,
	RegisterInput,
	Role,
	User,
} from "@seapedia/shared";
import { getJson, postJson } from "./api";

export function register(input: RegisterInput) {
	return postJson<AuthResponse>("/api/auth/register", input);
}

export function login(input: LoginInput) {
	return postJson<AuthResponse>("/api/auth/login", input);
}

export function setActiveRole(token: string, role: Role) {
	return postJson<AuthResponse>("/api/auth/active-role", { role }, token);
}

export function me(token: string) {
	return getJson<User>("/api/auth/me", token);
}

export interface BalanceSummary {
	activeRole: Role | null;
	wallet: { balance: number | null } | null;
	sellerIncome: { total: number | null } | null;
	driverEarnings: { total: number | null } | null;
}

export function getBalance(token: string) {
	return getJson<BalanceSummary>("/api/auth/balance", token);
}

// --- Guards (used by route loaders) ---

// Require a logged-in user; redirect to /login otherwise
export function requireUser(user: User | null): User {
	if (!user) throw redirect("/login");
	return user;
}

// Ensures user has a role and is permitted for the current route
export function requireActiveRole(
	user: User | null,
	allowed?: Role[],
	request?: Request,
): User {
	const u = requireUser(user);

	if (!u.activeRole) throw redirect("/select-role");

	if (allowed && !allowed.includes(u.activeRole)) {
		// Check if the user owns at least one of the allowed roles so we can offer a switch.
		const ownsRequired = allowed.some((r) => u.roles.includes(r));

		if (ownsRequired) {
			// Preserve destination to redirect back after switchin
			const next = request ? new URL(request.url).pathname : "/dashboard";
			throw redirect(`/select-role?next=${encodeURIComponent(next)}`);
		}

		// User doesn't own any allowed role, send them to profile
		throw redirect("/dashboard");
	}

	return u;
}
