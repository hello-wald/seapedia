import { Link } from "react-router";
import { ORDER_STATUS_LABELS, type OrderSummary } from "@seapedia/shared";
import type { Route } from "./+types/orders";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { tokenContext } from "~/.server/middleware";
import { getOrders } from "~/.server/orders";
import { formatRupiah } from "~/lib/format";
import { OrderStatusBadge } from "~/components/order/order-status-badge";

export function meta() {
	return [{ title: "Orders · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { orders: [] as OrderSummary[] };
	const orders = await getOrders(token);
	return { orders: orders ?? [] };
}

export default function BuyerOrders({ loaderData }: Route.ComponentProps) {
	const { orders } = loaderData;

	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Your orders</h1>
			<p className="mt-1 text-sm text-muted">
				Track the orders you've placed.
			</p>

			{orders.length === 0 ? (
				<div className="mt-6 rounded-lg border border-dashed p-10 text-center">
					<p className="font-medium text-gray-700">No orders yet.</p>
					<p className="mt-1 text-sm text-muted">
						Your placed orders will appear here.
					</p>
					<Link to="/products" className="mt-4 inline-block">
						<Button variant="outline">Browse products</Button>
					</Link>
				</div>
			) : (
				<div className="mt-6 space-y-3">
					{orders.map((order) => (
						<Link
							key={order.id}
							to={`/buyer/orders/${order.id}`}
							className="block"
						>
							<Card className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-gray-50">
								<div className="min-w-0">
									<div className="flex items-center gap-2">
										<p className="truncate font-medium text-gray-900">
											{order.store.name}
										</p>
										<OrderStatusBadge status={order.status} />
									</div>
									<p className="mt-0.5 text-sm text-muted">
										{order.totalItems}{" "}
										{order.totalItems === 1
											? "item"
											: "items"}{" "}
										·{" "}
										{new Date(
											order.createdAt,
										).toLocaleDateString("id-ID")}
									</p>
								</div>
								<p className="shrink-0 font-semibold text-gray-900">
									{formatRupiah(order.total)}
								</p>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
