import { useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { Clock, RotateCcw } from "lucide-react";
import {
	DELIVERY_METHOD_LABELS,
	orderDeadline,
	type OverduePage,
} from "@seapedia/shared";
import type { Route } from "./+types/overdue";
import { requireToken, tokenContext } from "~/.server/middleware";
import {
	advanceClock,
	getOverduePage,
	resetClock,
	runOverdue,
} from "~/.server/admin";
import { AdminTable } from "~/components/admin/admin-table";
import { TableCell, TableRow } from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { OrderStatusBadge } from "~/components/order/order-status-badge";
import { formatRupiah } from "~/lib/format";

export function meta() {
	return [{ title: "Overdue · Admin · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { page: null as OverduePage | null };
	const page = await getOverduePage(token);
	return { page };
}

export async function action({ context, request }: Route.ActionArgs) {
	const token = requireToken(context);
	const intent = (await request.formData()).get("intent");

	if (intent === "advance") {
		await advanceClock(token, 1);
		return { ok: true as const };
	}
	if (intent === "reset") {
		await resetClock(token);
		return { ok: true as const };
	}
	if (intent === "run") {
		const res = await runOverdue(token);
		return res.ok
			? { ok: true as const, result: res.data }
			: { ok: false as const, error: res.error };
	}
	return { ok: false as const, error: "Unknown action" };
}

const fmtDate = (d: string | Date) =>
	new Date(d).toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});

export default function AdminOverdue({ loaderData }: Route.ComponentProps) {
	const { page } = loaderData;
	const fetcher = useFetcher<typeof action>();
	const busy = fetcher.state !== "idle";

	useEffect(() => {
		const data = fetcher.data;
		if (fetcher.state === "idle" && data) {
			if (!data.ok) toast.error(data.error);
			else if ("result" in data && data.result) {
				const { processed, refundedTotal } = data.result;
				toast.success(
					processed === 0
						? "No overdue orders to handle"
						: `Returned & refunded ${processed} order${processed === 1 ? "" : "s"} · ${formatRupiah(refundedTotal)}`,
				);
			}
		}
	}, [fetcher.state, fetcher.data]);

	if (!page) {
		return (
			<div>
				<h1 className="text-xl font-semibold text-gray-900">Overdue</h1>
				<p className="mt-2 text-sm text-muted">Unavailable.</p>
			</div>
		);
	}

	const { clock, overdue, returned } = page;

	return (
		<div className="space-y-10">
			<section>
				<h1 className="text-xl font-semibold text-gray-900">
					Overdue handling
				</h1>
				<p className="mt-1 text-sm text-muted">
					Orders past their delivery SLA are auto-returned and fully
					refunded to the buyer's wallet. Stock is restored. SLA:
					Instant same day, Next Day +1, Regular +3.
				</p>

				<div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border bg-surface p-4">
					<div className="flex items-center gap-2">
						<Clock size={18} className="text-brand-600" aria-hidden />
						<div>
							<p className="text-[11px] uppercase tracking-wide text-muted">
								Simulated date
							</p>
							<p className="text-sm font-medium text-gray-900">
								{fmtDate(clock.now)}{" "}
								<span className="text-muted">
									{clock.offsetDays > 0
										? `(+${clock.offsetDays} day${clock.offsetDays === 1 ? "" : "s"})`
										: "(real time)"}
								</span>
							</p>
						</div>
					</div>
					<div className="ml-auto flex gap-2">
						<fetcher.Form method="post">
							<input type="hidden" name="intent" value="advance" />
							<Button
								type="submit"
								variant="secondary"
								size="sm"
								disabled={busy}
							>
								Advance 1 day
							</Button>
						</fetcher.Form>
						<fetcher.Form method="post">
							<input type="hidden" name="intent" value="reset" />
							<Button
								type="submit"
								variant="ghost"
								size="sm"
								disabled={busy || clock.offsetDays === 0}
							>
								<RotateCcw size={14} aria-hidden />
								Reset
							</Button>
						</fetcher.Form>
					</div>
				</div>
			</section>

			<section>
				<div className="flex items-center justify-between">
					<div>
						<h2 className="text-xl font-semibold text-gray-900">
							Overdue now
						</h2>
						<p className="mt-1 text-sm text-muted">
							{overdue.length} order{overdue.length === 1 ? "" : "s"}{" "}
							past SLA as of the simulated date
						</p>
					</div>
					{overdue.length > 0 && (
						<fetcher.Form method="post">
							<input type="hidden" name="intent" value="run" />
							<Button type="submit" size="sm" disabled={busy}>
								{busy ? "Processing…" : "Run overdue handling"}
							</Button>
						</fetcher.Form>
					)}
				</div>
				<AdminTable
					columns={["Order", "Buyer", "Store", "Delivery", "Total", "Due"]}
					isEmpty={overdue.length === 0}
				>
					{overdue.map((o) => (
						<TableRow key={o.id}>
							<TableCell className="font-medium text-brand-600">
								{o.id.slice(-6).toUpperCase()}
							</TableCell>
							<TableCell className="text-gray-700">
								{o.buyerName}
							</TableCell>
							<TableCell className="text-gray-700">
								{o.store.name}
							</TableCell>
							<TableCell className="text-gray-700">
								{DELIVERY_METHOD_LABELS[o.deliveryMethod]}
							</TableCell>
							<TableCell className="text-gray-900">
								{formatRupiah(o.total)}
							</TableCell>
							<TableCell className="text-destructive">
								{fmtDate(
									orderDeadline(o.createdAt, o.deliveryMethod),
								)}
							</TableCell>
						</TableRow>
					))}
				</AdminTable>
			</section>

			<section>
				<h2 className="text-xl font-semibold text-gray-900">
					Returned &amp; refunded
				</h2>
				<p className="mt-1 text-sm text-muted">
					{returned.length} order{returned.length === 1 ? "" : "s"}
				</p>
				<AdminTable
					columns={["Order", "Buyer", "Store", "Refunded", "Status"]}
					isEmpty={returned.length === 0}
				>
					{returned.map((o) => (
						<TableRow key={o.id}>
							<TableCell className="font-medium text-brand-600">
								{o.id.slice(-6).toUpperCase()}
							</TableCell>
							<TableCell className="text-gray-700">
								{o.buyerName}
							</TableCell>
							<TableCell className="text-gray-700">
								{o.store.name}
							</TableCell>
							<TableCell className="text-gray-900">
								{formatRupiah(o.total)}
							</TableCell>
							<TableCell>
								<OrderStatusBadge status={o.status} />
							</TableCell>
						</TableRow>
					))}
				</AdminTable>
			</section>
		</div>
	);
}
