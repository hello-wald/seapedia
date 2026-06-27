import type { AdminStoreRow } from "@seapedia/shared";
import type { Route } from "./+types/stores";
import { tokenContext } from "~/.server/middleware";
import { getAdminStores } from "~/.server/admin";
import { AdminTable } from "~/components/admin/admin-table";
import { TableCell, TableRow } from "~/components/ui/table";

export function meta() {
	return [{ title: "Stores · Admin · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { stores: [] as AdminStoreRow[] };
	const stores = await getAdminStores(token);
	return { stores: stores ?? [] };
}

export default function AdminStores({ loaderData }: Route.ComponentProps) {
	const { stores } = loaderData;
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Stores</h1>
			<p className="mt-1 text-sm text-muted">{stores.length} stores</p>
			<AdminTable
				columns={["Store", "Owner", "Products", "Orders", "Created"]}
				isEmpty={stores.length === 0}
			>
				{stores.map((s) => (
					<TableRow key={s.id}>
						<TableCell className="font-medium text-gray-900">
							{s.name}
						</TableCell>
						<TableCell className="text-gray-700">
							{s.ownerName}
						</TableCell>
						<TableCell className="text-gray-700">
							{s.productCount}
						</TableCell>
						<TableCell className="text-gray-700">
							{s.orderCount}
						</TableCell>
						<TableCell className="text-gray-700">
							{new Date(s.createdAt).toLocaleDateString("id-ID")}
						</TableCell>
					</TableRow>
				))}
			</AdminTable>
		</div>
	);
}
