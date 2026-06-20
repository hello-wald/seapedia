import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireActiveRole } from "../../lib/auth.server";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";

export async function loader({ request }: Route.LoaderArgs) {
	const user = await requireActiveRole(request, ["ADMIN"]);
	return { user };
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
	return (
		<DashboardLayout user={loaderData.user}>
			<Outlet />
		</DashboardLayout>
	);
}
