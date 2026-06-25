import { Link, useNavigate } from "react-router";
import { Eye } from "lucide-react";
import { DELIVERY_METHOD_LABELS, type OrderSummary } from "@seapedia/shared";
import type { Route } from "./+types/orders";
import { Button } from "~/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { tokenContext } from "~/.server/middleware";
import { getOrders } from "~/.server/orders";
import { getBuyerReport } from "~/.server/reports";
import { formatRupiah } from "~/lib/format";
import { OrderStatusBadge } from "~/components/order/order-status-badge";
import { ReportCards } from "~/components/report/report-cards";

export function meta() {
	return [{ title: "Orders · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { orders: [] as OrderSummary[], report: null };
	const [orders, report] = await Promise.all([
		getOrders(token),
		getBuyerReport(token),
	]);
	return { orders: orders ?? [], report };
}

export default function BuyerOrders({ loaderData }: Route.ComponentProps) {
	const { orders, report } = loaderData;
	const navigate = useNavigate();

	const stats = report
		? [
				{
					label: "Total spent",
					value: formatRupiah(report.totalSpent),
					caption: "Across all your orders",
				},
				{
					label: "Orders placed",
					value: String(report.ordersPlaced),
					caption: "Excludes cancelled",
				},
				{
					label: "Items bought",
					value: String(report.itemsBought),
					caption: "Total units ordered",
				},
				{
					label: "Total saved",
					value: formatRupiah(report.totalSaved),
					caption: "From vouchers & promos",
				},
			]
		: [];

	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Your orders</h1>
			<p className="mt-1 text-sm text-muted">
				Track the orders you've placed.
			</p>

			{stats.length > 0 && (
				<div className="mt-6">
					<ReportCards stats={stats} />
				</div>
			)}

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
				<div className="mt-6 rounded-lg border overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-surface">
								<TableHead>Order</TableHead>
								<TableHead>Store</TableHead>
								<TableHead>Delivery</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">
									Total
								</TableHead>
								<TableHead className="w-12">
									<span className="sr-only">View</span>
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.map((order) => (
								<TableRow
									key={order.id}
									className="group h-18 cursor-pointer"
									onClick={() =>
										navigate(`/buyer/orders/${order.id}`)
									}
								>
									<TableCell className="font-medium text-gray-900">
										<span className="text-brand-600">
											{order.id.slice(-6).toUpperCase()}
										</span>
										<span className="ml-1 text-muted">
											· {order.totalItems}{" "}
											{order.totalItems === 1
												? "item"
												: "items"}
										</span>
									</TableCell>
									<TableCell className="text-gray-700">
										{order.store.name}
									</TableCell>
									<TableCell className="text-gray-700">
										{
											DELIVERY_METHOD_LABELS[
												order.deliveryMethod
											]
										}
									</TableCell>
									<TableCell className="text-gray-700">
										{new Date(
											order.createdAt,
										).toLocaleDateString("id-ID")}
									</TableCell>
									<TableCell>
										<OrderStatusBadge
											status={order.status}
										/>
									</TableCell>
									<TableCell className="text-right font-medium text-gray-900">
										{formatRupiah(order.total)}
									</TableCell>
									<TableCell className="text-right text-muted group-hover:text-brand-600">
										<Eye className="ml-auto size-4" />
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			)}
		</div>
	);
}
