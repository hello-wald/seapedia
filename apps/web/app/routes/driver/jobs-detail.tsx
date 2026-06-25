import { redirect } from "react-router";
import type { Route } from "./+types/jobs-detail";
import { requireToken } from "~/.server/middleware";
import { getDeliveryDetail } from "~/.server/delivery";
import { OrderDetailView } from "~/components/order/order-detail-view";

export function meta() {
	return [{ title: "Job detail · SEApedia" }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
	const token = requireToken(context);
	const job = await getDeliveryDetail(token, params.id);
	if (!job) throw redirect("/driver/jobs");
	return { job };
}

export default function DriverJobDetail({ loaderData }: Route.ComponentProps) {
	const { job } = loaderData;

	return (
		<OrderDetailView
			order={job}
			backHref="/driver/jobs"
			backLabel="Back to jobs"
		/>
	);
}
