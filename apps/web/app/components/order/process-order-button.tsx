import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";

type ProcessActionData = { ok: true } | { ok: false; error: string };

export function ProcessOrderButton({ orderId }: { orderId: string }) {
	const fetcher = useFetcher<ProcessActionData>();
	const submitting = fetcher.state !== "idle";

	return (
		<fetcher.Form method="post">
			<input type="hidden" name="id" value={orderId} />
			<Button type="submit" size="sm" disabled={submitting}>
				{submitting ? "Processing…" : "Process"}
			</Button>
			{fetcher.data && !fetcher.data.ok && (
				<span className="text-xs text-red-600">
					{fetcher.data.error}
				</span>
			)}
		</fetcher.Form>
	);
}
