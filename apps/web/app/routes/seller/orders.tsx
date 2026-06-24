import { Link, redirect } from "react-router";
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
import { getIncomingOrders, processOrder } from "~/.server/orders";
import { formatRupiah } from "~/lib/format";
import { OrderStatusBadge } from "~/components/order/order-status-badge";
import { ProcessOrderButton } from "~/components/order/process-order-button";

export function meta() {
	return [{ title: "Incoming orders · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { orders: [] as OrderSummary[] };
	const orders = await getIncomingOrders(token);
	return { orders: orders ?? [] };
}

export async function action({ request, context }: Route.ActionArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");

	const formData = await request.formData();
	const id = formData.get("id");
	if (typeof id !== "string" || !id) {
		return { ok: false, error: "Missing order id" };
	}

	const result = await processOrder(token, id);
	if (!result.ok) {
		return { ok: false, error: result.error };
	}
	return { ok: true };
}

export default function SellerOrders({ loaderData }: Route.ComponentProps) {
	const { orders } = loaderData;

	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">
				Incoming orders
			</h1>
			<p className="mt-1 text-sm text-muted">
				Orders placed for your store's products. Process an order to
				make it available for pickup.
			</p>

			{orders.length === 0 ? (
				<div className="mt-6 rounded-lg border border-dashed p-10 text-center">
					<p className="font-medium text-gray-700">No orders yet.</p>
					<p className="mt-1 text-sm text-muted">
						Orders from buyers will show up here.
					</p>
				</div>
			) : (
				<div className="mt-6 rounded-lg border">
					<Table>
						<TableHeader className="bg-surface">
							<TableRow>
								<TableHead>Order</TableHead>
								<TableHead>Buyer</TableHead>
								<TableHead>Delivery</TableHead>
								<TableHead>Date</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-right">
									Total
								</TableHead>
								<TableHead className="text-right">
									Action
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{orders.map((order) => (
								<TableRow key={order.id}>
									<TableCell className="font-medium text-gray-900">
										<Link
											to={`/seller/orders/${order.id}`}
											className="text-brand-700 hover:underline"
										>
											{order.id.slice(-6).toUpperCase()}
										</Link>
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
									<TableCell className="text-right">
										{order.status === "SEDANG_DIKEMAS" ? (
											<ProcessOrderButton
												orderId={order.id}
											/>
										) : (
											<span className="text-muted">
												—
											</span>
										)}
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
