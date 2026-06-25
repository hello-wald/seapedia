import { useNavigate } from "react-router";
import { Eye } from "lucide-react";
import { DELIVERY_METHOD_LABELS, type OrderSummary } from "@seapedia/shared";
import type { Route } from "./+types/orders";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { tokenContext } from "~/.server/middleware";
import { getIncomingOrders } from "~/.server/orders";
import { getSellerReport } from "~/.server/reports";
import { formatRupiah } from "~/lib/format";
import { OrderStatusBadge } from "~/components/order/order-status-badge";
import { ReportCards } from "~/components/report/report-cards";

export function meta() {
	return [{ title: "Incoming orders · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { orders: [] as OrderSummary[], report: null };
	const [orders, report] = await Promise.all([
		getIncomingOrders(token),
		getSellerReport(token),
	]);
	return { orders: orders ?? [], report };
}

export default function SellerOrders({ loaderData }: Route.ComponentProps) {
	const { orders, report } = loaderData;
	const navigate = useNavigate();

	const stats = report
		? [
				{
					label: "Completed income",
					value: formatRupiah(report.completedIncome),
					caption: "From completed orders",
				},
				{
					label: "Pending income",
					value: formatRupiah(report.pendingIncome),
					caption: "Awaiting delivery completion",
				},
				{
					label: "Completed orders",
					value: String(report.completedOrders),
					caption: "Delivered & finalized",
				},
				{
					label: "Items sold",
					value: String(report.itemsSold),
					caption: "Total units sold",
				},
			]
		: [];

	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">
				Incoming orders
			</h1>
			<p className="mt-1 text-sm text-muted">
				Orders placed for your store's products. Process an order to
				make it available for pickup.
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
						Orders from buyers will show up here.
					</p>
				</div>
			) : (
				<div className="mt-6 rounded-lg border overflow-hidden">
					<Table>
						<TableHeader>
							<TableRow className="bg-surface">
								<TableHead>Order</TableHead>
								<TableHead>Buyer</TableHead>
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
									className="group cursor-pointer"
									onClick={() =>
										navigate(`/seller/orders/${order.id}`)
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
										{order.buyerName}
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
