import type { ReactNode } from "react";
import { Link } from "react-router";
import {
	DELIVERY_METHOD_LABELS,
	DISCOUNT_KIND_LABELS,
	ORDER_STATUS_LABELS,
	PPN_RATE,
	type Order,
} from "@seapedia/shared";
import { Card } from "~/components/ui/card";
import { formatRupiah } from "~/lib/format";
import { OrderStatusBadge } from "~/components/order/order-status-badge";
import { OrderStatusTracker } from "~/components/order/order-status-tracker";

interface OrderDetailViewProps {
	order: Order;
	backHref: string;
	backLabel?: string;
	action?: ReactNode;
}

export function OrderDetailView({
	order,
	backHref,
	backLabel = "Back to orders",
	action,
}: OrderDetailViewProps) {
	return (
		<div className="space-y-6">
			<div>
				<Link
					to={backHref}
					className="text-sm text-brand-700 hover:underline"
				>
					← {backLabel}
				</Link>
				<div className="flex justify-between mt-2 h-8 gap-4">
					<div className="flex items-center gap-3">
						<h1 className="text-xl font-semibold text-gray-900 truncate">
							Order {order.id.slice(-6).toUpperCase()}
						</h1>
						<OrderStatusBadge status={order.status} />
					</div>
					{action && <div className="shrink-0">{action}</div>}
				</div>
				<p className="mt-1 text-sm text-muted">
					{order.store.name} ·{" "}
					{new Date(order.createdAt).toLocaleString("id-ID")}
				</p>
			</div>

			<Card className="p-5">
				<OrderStatusTracker
					status={order.status}
					statusHistory={order.statusHistory}
				/>
			</Card>

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
						{order.discount > 0 && (
							<div className="flex justify-between">
								<dt className="text-muted">
									Discount
									{order.discountKind &&
										` (${DISCOUNT_KIND_LABELS[order.discountKind]}${
											order.discountCode
												? ` ${order.discountCode}`
												: ""
										})`}
								</dt>
								<dd className="text-success">
									−{formatRupiah(order.discount)}
								</dd>
							</div>
						)}
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
						<div className="flex justify-between border-t mt-3 pt-3">
							<dt className="font-semibold text-gray-900">
								Total
							</dt>
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
