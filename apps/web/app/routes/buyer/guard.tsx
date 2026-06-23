import { Outlet } from "react-router";
import type { Route } from "./+types/guard";
import { requireActiveRole } from "~/.server/auth";
import { userContext } from "~/.server/middleware";

export function loader({ request, context }: Route.LoaderArgs) {
	requireActiveRole(context.get(userContext), ["BUYER"], request);
	return null;
}

export default function BuyerGuard() {
	return <Outlet />;
}
