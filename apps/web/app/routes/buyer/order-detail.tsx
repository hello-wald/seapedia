import { redirect } from "react-router";
import type { Route } from "./+types/order-detail";
import { requireToken } from "~/.server/middleware";
import { getOrder } from "~/.server/orders";
import { OrderDetailView } from "~/components/order/order-detail-view";

export function meta() {
	return [{ title: "Order detail · SEApedia" }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
	const token = requireToken(context);
	const order = await getOrder(token, params.id);
	if (!order) throw redirect("/buyer/orders");
	return { order };
}

export default function OrderDetail({ loaderData }: Route.ComponentProps) {
	const { order } = loaderData;
	return <OrderDetailView order={order} backHref="/buyer/orders" />;
}
