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

// Sanitize a redirect target: only allow same-origin paths
export function safeNext(value: FormDataEntryValue | string | null): string {
	const next = typeof value === "string" ? value : "";
	return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
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
		// Send to access-denied boundary.
		const next = request
			? new URL(request.url).pathname.replace(/\.data$/, "") // Strip RR single-fetch .data suffix
			: "/dashboard";
		const params = new URLSearchParams({
			next,
			roles: allowed.join(","),
		});
		throw redirect(`/no-access?${params}`);
	}

	return u;
}
