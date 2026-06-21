import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireActiveRole } from "~/.server/auth";
import { userContext } from "~/.server/middleware";
import { DashboardLayout } from "~/components/layout/dashboard-layout";

export function loader({ request, context }: Route.LoaderArgs) {
	const user = requireActiveRole(
		context.get(userContext),
		["SELLER"],
		request,
	);
	return { user };
}

export default function SellerLayout({ loaderData }: Route.ComponentProps) {
	return (
		<DashboardLayout user={loaderData.user}>
			<Outlet />
		</DashboardLayout>
	);
}
