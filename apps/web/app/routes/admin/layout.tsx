import { Outlet } from "react-router";
import type { Route } from "./+types/layout";
import { requireActiveRole } from "~/.server/auth";
import { userContext } from "~/.server/middleware";
import { ProfileLayout } from "../../components/layout/profile-layout";

export function loader({ request, context }: Route.LoaderArgs) {
	const user = requireActiveRole(
		context.get(userContext),
		["ADMIN"],
		request,
	);
	return { user };
}

export default function AdminLayout({ loaderData }: Route.ComponentProps) {
	return (
		<ProfileLayout user={loaderData.user}>
			<Outlet />
		</ProfileLayout>
	);
}
