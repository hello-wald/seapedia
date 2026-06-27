import type { AdminUserRow } from "@seapedia/shared";
import type { Route } from "./+types/users";
import { tokenContext } from "~/.server/middleware";
import { getAdminUsers } from "~/.server/admin";
import { AdminTable } from "~/components/admin/admin-table";
import { TableCell, TableRow } from "~/components/ui/table";

export function meta() {
	return [{ title: "Users · Admin · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { users: [] as AdminUserRow[] };
	const users = await getAdminUsers(token);
	return { users: users ?? [] };
}

export default function AdminUsers({ loaderData }: Route.ComponentProps) {
	const { users } = loaderData;
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Users</h1>
			<p className="mt-1 text-sm text-muted">{users.length} users</p>
			<AdminTable
				columns={["Name", "Email", "Roles", "Joined"]}
				isEmpty={users.length === 0}
			>
				{users.map((u) => (
					<TableRow key={u.id}>
						<TableCell className="font-medium text-gray-900">
							{u.name}
						</TableCell>
						<TableCell className="text-gray-700">{u.email}</TableCell>
						<TableCell className="text-gray-700">
							{u.roles.join(", ")}
						</TableCell>
						<TableCell className="text-gray-700">
							{new Date(u.createdAt).toLocaleDateString("id-ID")}
						</TableCell>
					</TableRow>
				))}
			</AdminTable>
		</div>
	);
}
