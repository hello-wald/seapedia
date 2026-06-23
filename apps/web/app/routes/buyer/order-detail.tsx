import { Link, redirect } from "react-router";
import {
	DELIVERY_METHOD_LABELS,
	ORDER_STATUS_LABELS,
	PPN_RATE,
} from "@seapedia/shared";
import type { Route } from "./+types/order-detail";
import { Card } from "~/components/ui/card";
import { tokenContext } from "~/.server/middleware";
import { getOrder } from "~/.server/orders";
import { formatRupiah } from "~/lib/format";
import { OrderStatusBadge } from "~/components/order/order-status-badge";

export function meta() {
	return [{ title: "Order detail · SEApedia" }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");
	const order = await getOrder(token, params.id);
	if (!order) throw redirect("/buyer/orders");
	return { order };
}

export default function OrderDetail({ loaderData }: Route.ComponentProps) {
	const { order } = loaderData;

	return (
		<div className="space-y-6">
			<div>
				<Link
					to="/buyer/orders"
					className="text-sm text-brand-700 hover:underline"
				>
					← Back to orders
				</Link>
				<div className="mt-2 flex items-center gap-3">
					<h1 className="text-xl font-semibold text-gray-900">
						Order {order.id.slice(-6).toUpperCase()}
					</h1>
					<OrderStatusBadge status={order.status} />
				</div>
				<p className="mt-1 text-sm text-muted">
					{order.store.name} ·{" "}
					{new Date(order.createdAt).toLocaleString("id-ID")}
				</p>
			</div>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
				<div className="space-y-6">
					<Card className="p-5">
						<h2 className="text-sm font-semibold text-gray-900">
							Items
						</h2>
						<ul className="mt-3 divide-y divide-border">
							{order.items.map((item) => (
								<li
									key={item.id}
									className="flex justify-between gap-4 py-2 text-sm"
								>
									<span className="text-gray-900">
										{item.name}{" "}
										<span className="text-muted">
											× {item.quantity} @{" "}
											{formatRupiah(item.unitPrice)}
										</span>
									</span>
									<span className="text-gray-700">
										{formatRupiah(item.lineTotal)}
									</span>
								</li>
							))}
						</ul>
					</Card>

					<Card className="p-5">
						<h2 className="text-sm font-semibold text-gray-900">
							Delivery
						</h2>
						<p className="mt-2 text-sm text-gray-700">
							{DELIVERY_METHOD_LABELS[order.deliveryMethod]}
						</p>
						<p className="mt-2 text-sm text-gray-900">
							{order.recipientName} · {order.phone}
						</p>
						<p className="text-sm text-muted">
							{order.addressLine1}, {order.city}, {order.province}{" "}
							{order.postalCode}
						</p>
					</Card>

					<Card className="p-5">
						<h2 className="text-sm font-semibold text-gray-900">
							Status history
						</h2>
						<ol className="mt-3 space-y-2">
							{order.statusHistory.map((h) => (
								<li
									key={h.id}
									className="flex justify-between text-sm"
								>
									<span className="text-gray-900">
										{ORDER_STATUS_LABELS[h.status]}
									</span>
									<span className="text-muted">
										{new Date(h.createdAt).toLocaleString(
											"id-ID",
										)}
									</span>
								</li>
							))}
						</ol>
					</Card>
				</div>

				<Card className="h-fit p-5">
					<h2 className="text-sm font-semibold text-gray-900">
						Payment summary
					</h2>
					<dl className="mt-4 space-y-2 text-sm">
						<div className="flex justify-between">
							<dt className="text-muted">Subtotal</dt>
							<dd className="text-gray-900">
								{formatRupiah(order.subtotal)}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-muted">Delivery</dt>
							<dd className="text-gray-900">
								{formatRupiah(order.deliveryFee)}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-muted">
								PPN ({Math.round(PPN_RATE * 100)}%)
							</dt>
							<dd className="text-gray-900">
								{formatRupiah(order.tax)}
							</dd>
						</div>
						<div className="flex justify-between border-t pt-3">
							<dt className="font-semibold text-gray-900">Total</dt>
							<dd className="text-lg font-bold text-gray-900">
								{formatRupiah(order.total)}
							</dd>
						</div>
					</dl>
				</Card>
			</div>
		</div>
	);
}
