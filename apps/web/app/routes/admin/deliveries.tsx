import { DELIVERY_METHOD_LABELS, type AdminDeliveryRow } from "@seapedia/shared";
import type { Route } from "./+types/deliveries";
import { tokenContext } from "~/.server/middleware";
import { getAdminDeliveries } from "~/.server/admin";
import { AdminTable } from "~/components/admin/admin-table";
import { TableCell, TableRow } from "~/components/ui/table";
import { OrderStatusBadge } from "~/components/order/order-status-badge";
import { formatRupiah } from "~/lib/format";

export function meta() {
	return [{ title: "Delivery jobs · Admin · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { deliveries: [] as AdminDeliveryRow[] };
	const deliveries = await getAdminDeliveries(token);
	return { deliveries: deliveries ?? [] };
}

export default function AdminDeliveries({ loaderData }: Route.ComponentProps) {
	const { deliveries } = loaderData;
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">
				Delivery jobs
			</h1>
			<p className="mt-1 text-sm text-muted">{deliveries.length} jobs</p>
			<AdminTable
				columns={["Order", "Driver", "Status", "Delivery", "Fee", "Completed"]}
				isEmpty={deliveries.length === 0}
			>
				{deliveries.map((d) => (
					<TableRow key={d.id}>
						<TableCell className="font-medium text-brand-600">
							{d.orderId.slice(-6).toUpperCase()}
						</TableCell>
						<TableCell className="text-gray-700">
							{d.driverName ?? "—"}
						</TableCell>
						<TableCell>
							<OrderStatusBadge status={d.status} />
						</TableCell>
						<TableCell className="text-gray-700">
							{DELIVERY_METHOD_LABELS[d.deliveryMethod]}
						</TableCell>
						<TableCell className="text-gray-900">
							{formatRupiah(d.deliveryFee)}
						</TableCell>
						<TableCell className="text-gray-700">
							{d.completedAt
								? new Date(d.completedAt).toLocaleDateString(
										"id-ID",
									)
								: "—"}
						</TableCell>
					</TableRow>
				))}
			</AdminTable>
		</div>
	);
}
