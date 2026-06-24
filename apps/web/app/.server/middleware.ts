import { createContext, redirect } from "react-router";
import type { MiddlewareFunction, RouterContextProvider } from "react-router";
import type { User } from "@seapedia/shared";
import { me } from "./auth";
import { getToken } from "./session";

export const userContext = createContext<User | null>(null);
export const tokenContext = createContext<string | null>(null);

// Require an auth token from context
export function requireToken(context: Readonly<RouterContextProvider>): string {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");
	return token;
}

export const authMiddleware: MiddlewareFunction = async (
	{ request, context },
	next,
) => {
	const token = await getToken(request);
	context.set(tokenContext, token);
	context.set(userContext, token ? await me(token) : null);
	return next();
};
