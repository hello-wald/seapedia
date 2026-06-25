import { redirect, useFetcher } from "react-router";
import type { Route } from "./+types/jobs-detail";
import { requireToken } from "~/.server/middleware";
import { completeJob, getDeliveryDetail, takeJob } from "~/.server/delivery";
import { OrderDetailView } from "~/components/order/order-detail-view";
import { Button } from "~/components/ui/button";

export function meta() {
	return [{ title: "Job detail · SEApedia" }];
}

export async function loader({ context, params }: Route.LoaderArgs) {
	const token = requireToken(context);
	const job = await getDeliveryDetail(token, params.id);
	if (!job) throw redirect("/driver/jobs");
	return { job };
}

export async function action({ context, params, request }: Route.ActionArgs) {
	const token = requireToken(context);
	const formData = await request.formData();
	const intent = formData.get("intent");

	const result =
		intent === "complete"
			? await completeJob(token, params.id)
			: await takeJob(token, params.id);

	if (!result.ok) {
		return { ok: false as const, error: result.error };
	}
	return { ok: true as const };
}

export default function DriverJobDetail({ loaderData }: Route.ComponentProps) {
	const { job } = loaderData;
	const fetcher = useFetcher<typeof action>();
	const submitting = fetcher.state !== "idle";

	let control = null;
	if (job.status === "MENUNGGU_PENGIRIM") {
		control = (
			<fetcher.Form method="post">
				<input type="hidden" name="intent" value="take" />
				<Button type="submit" size="sm" disabled={submitting}>
					{submitting ? "Taking…" : "Take Job"}
				</Button>
				{fetcher.data && !fetcher.data.ok && (
					<span className="ml-2 text-xs text-red-600">
						{fetcher.data.error}
					</span>
				)}
			</fetcher.Form>
		);
	} else if (job.status === "DIKIRIM") {
		control = (
			<fetcher.Form method="post">
				<input type="hidden" name="intent" value="complete" />
				<Button type="submit" size="sm" disabled={submitting}>
					{submitting ? "Completing…" : "Complete Job"}
				</Button>
				{fetcher.data && !fetcher.data.ok && (
					<span className="ml-2 text-xs text-red-600">
						{fetcher.data.error}
					</span>
				)}
			</fetcher.Form>
		);
	}

	return (
		<OrderDetailView
			order={job}
			backHref="/driver/jobs"
			backLabel="Back to jobs"
			action={control}
		/>
	);
}
