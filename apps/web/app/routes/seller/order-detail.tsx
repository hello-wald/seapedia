import { redirect, useFetcher } from "react-router";
import type { Route } from "./+types/order-detail";
import { tokenContext } from "~/.server/middleware";
import { getOrder, processOrder } from "~/.server/orders";
import { OrderDetailView } from "~/components/order/order-detail-view";
import { Button } from "~/components/ui/button";

export function meta() {
	return [{ title: "Order detail · SEApedia" }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");
	const order = await getOrder(token, params.id);
	if (!order) throw redirect("/seller/orders");
	return { order };
}

export async function action({ context, params }: Route.ActionArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");
	const result = await processOrder(token, params.id);
	if (!result.ok) {
		return { ok: false as const, error: result.error };
	}
	return { ok: true as const };
}

export default function SellerOrderDetail({
	loaderData,
}: Route.ComponentProps) {
	const { order } = loaderData;
	const fetcher = useFetcher<typeof action>();
	const submitting = fetcher.state !== "idle";

	return (
		<OrderDetailView
			order={order}
			backHref="/seller/orders"
			action={
				order.status === "SEDANG_DIKEMAS" ? (
					<fetcher.Form method="post">
						<Button type="submit" size="sm" disabled={submitting}>
							{submitting ? "Processing…" : "Process Order"}
						</Button>
						{fetcher.data && !fetcher.data.ok && (
							<span className="text-xs text-red-600">
								{fetcher.data.error}
							</span>
						)}
					</fetcher.Form>
				) : null
			}
		/>
	);
}
