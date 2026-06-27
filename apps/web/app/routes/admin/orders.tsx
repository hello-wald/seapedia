import { DELIVERY_METHOD_LABELS, type OrderSummary } from "@seapedia/shared";
import type { Route } from "./+types/orders";
import { tokenContext } from "~/.server/middleware";
import { getAdminOrders } from "~/.server/admin";
import { AdminTable } from "~/components/admin/admin-table";
import { TableCell, TableRow } from "~/components/ui/table";
import { OrderStatusBadge } from "~/components/order/order-status-badge";
import { formatRupiah } from "~/lib/format";

export function meta() {
	return [{ title: "Orders · Admin · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { orders: [] as OrderSummary[] };
	const orders = await getAdminOrders(token);
	return { orders: orders ?? [] };
}

export default function AdminOrders({ loaderData }: Route.ComponentProps) {
	const { orders } = loaderData;
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Orders</h1>
			<p className="mt-1 text-sm text-muted">{orders.length} orders</p>
			<AdminTable
				columns={["Order", "Buyer", "Store", "Delivery", "Status", "Total", "Date"]}
				isEmpty={orders.length === 0}
			>
				{orders.map((o) => (
					<TableRow key={o.id}>
						<TableCell className="font-medium text-brand-600">
							{o.id.slice(-6).toUpperCase()}
						</TableCell>
						<TableCell className="text-gray-700">
							{o.buyerName}
						</TableCell>
						<TableCell className="text-gray-700">
							{o.store.name}
						</TableCell>
						<TableCell className="text-gray-700">
							{DELIVERY_METHOD_LABELS[o.deliveryMethod]}
						</TableCell>
						<TableCell>
							<OrderStatusBadge status={o.status} />
						</TableCell>
						<TableCell className="text-gray-900">
							{formatRupiah(o.total)}
						</TableCell>
						<TableCell className="text-gray-700">
							{new Date(o.createdAt).toLocaleDateString("id-ID")}
						</TableCell>
					</TableRow>
				))}
			</AdminTable>
		</div>
	);
}
