import { createCookieSessionStorage, redirect } from "react-router";

const TOKEN_KEY = "accessToken";

const sessionStorage = createCookieSessionStorage({
	cookie: {
		name: "__seapedia_session",
		httpOnly: true,
		path: "/",
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		secrets: [process.env.SESSION_SECRET ?? "dev-insecure-secret"],
		maxAge: 60 * 60 * 24 * 7,
	},
});

export function getSession(request: Request) {
	return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getToken(request: Request): Promise<string | null> {
	const session = await getSession(request);
	return session.get(TOKEN_KEY) ?? null;
}

// Store JWT and redirect
export async function createUserSession(token: string, redirectTo: string) {
	const session = await sessionStorage.getSession();
	session.set(TOKEN_KEY, token);
	return redirect(redirectTo, {
		headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
	});
}

// Clear session cookie and logout
export async function destroyUserSession(request: Request, redirectTo = "/") {
	const session = await getSession(request);
	return redirect(redirectTo, {
		headers: { "Set-Cookie": await sessionStorage.destroySession(session) },
	});
}
