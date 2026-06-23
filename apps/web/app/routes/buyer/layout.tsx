import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireUser } from "~/.server/auth";
import { userContext } from "~/.server/middleware";
import { DashboardLayout } from "../../components/layout/dashboard-layout";

export function loader({ context }: Route.LoaderArgs) {
	const user = requireUser(context.get(userContext));
	return { user };
}

export default function BuyerLayout({ loaderData }: Route.ComponentProps) {
	return (
		<DashboardLayout user={loaderData.user}>
			<Outlet />
		</DashboardLayout>
	);
}
