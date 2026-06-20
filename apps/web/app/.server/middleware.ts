import { createContext } from "react-router";
import type { MiddlewareFunction } from "react-router";
import type { User } from "@seapedia/shared";
import { me } from "./auth";
import { getToken } from "./session";

export const userContext = createContext<User | null>(null);
export const tokenContext = createContext<string | null>(null);

export const authMiddleware: MiddlewareFunction = async (
	{ request, context },
	next,
) => {
	const token = await getToken(request);
	context.set(tokenContext, token);
	context.set(userContext, token ? await me(token) : null);
	return next();
};
