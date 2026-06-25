import { ArrowRight, MapPin, Store } from "lucide-react";
import { DELIVERY_METHOD_LABELS, type DeliverySummary } from "@seapedia/shared";
import { formatRupiah } from "~/lib/format";
import { Button } from "~/components/ui/button";

export function DeliveryJobCard({ job }: { job: DeliverySummary }) {
	return (
		<article className="flex h-full flex-col rounded-lg border bg-surface p-4 transition-shadow hover:shadow-card">
			<div className="flex items-center justify-between">
				<span className="font-mono text-xs text-muted">
					#{job.orderId.slice(-6).toUpperCase()}
				</span>
				<span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
					{DELIVERY_METHOD_LABELS[job.deliveryMethod]}
				</span>
			</div>

			<div className="mt-3 flex items-start gap-2">
				<Store
					size={16}
					className="mt-0.5 shrink-0 text-muted"
					aria-hidden="true"
				/>
				<div>
					<p className="text-[11px] uppercase tracking-wide text-muted">
						Pickup
					</p>
					<p className="text-sm font-medium text-gray-900">
						{job.store.name}
					</p>
				</div>
			</div>

			<div className="mt-2.5 flex items-start gap-2">
				<MapPin
					size={16}
					className="mt-0.5 shrink-0 text-muted"
					aria-hidden="true"
				/>
				<div>
					<p className="text-[11px] uppercase tracking-wide text-muted">
						Dropoff
					</p>
					<p className="text-sm text-gray-900">{job.recipientName}</p>
					<p className="text-sm text-muted">
						{job.city}, {job.province}
					</p>
				</div>
			</div>

			<div className="mt-3 flex items-end justify-between border-t pt-4">
				<div>
					<p className="text-[11px] text-muted">
						Payout · {job.totalItems}{" "}
						{job.totalItems === 1 ? "item" : "items"}
					</p>
					<p className="text-md font-semibold text-brand-600">
						{formatRupiah(job.deliveryFee)}
					</p>
				</div>
				<Button>
					View job
					<ArrowRight size={14} aria-hidden="true" />
				</Button>
			</div>
		</article>
	);
}
