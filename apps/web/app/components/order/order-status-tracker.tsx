import { Check, X } from "lucide-react";
import {
	ORDER_STATUS_FLOW,
	ORDER_STATUS_LABELS,
	type OrderStatus,
	type OrderStatusHistory,
} from "@seapedia/shared";
import { cn } from "~/lib/utils";

interface OrderStatusTrackerProps {
	status: OrderStatus;
	statusHistory?: OrderStatusHistory[];
	compact?: boolean;
}

// Latest timestamp recorded for a given status.
function formatTimestamp(history: OrderStatusHistory[], status: OrderStatus) {
	let match: OrderStatusHistory | undefined;
	for (const h of history) {
		if (h.status === status) match = h;
	}
	return match ? new Date(match.createdAt) : null;
}

export function OrderStatusTracker({
	status,
	statusHistory = [],
	compact = false,
}: OrderStatusTrackerProps) {
	if (status === "DIKEMBALIKAN") {
		return (
			<span
				className={cn(
					"inline-flex items-center gap-1.5 rounded-md bg-red-100 px-2 py-0.5 font-medium text-red-800",
					compact ? "text-xs" : "text-sm",
				)}
			>
				<X
					className={compact ? "size-3" : "size-4"}
					aria-hidden="true"
				/>
				{ORDER_STATUS_LABELS.DIKEMBALIKAN}
			</span>
		);
	}

	const currentIndex = ORDER_STATUS_FLOW.indexOf(status);

	return (
		<ol className="flex items-start">
			{ORDER_STATUS_FLOW.map((step, i) => {
				const done = i < currentIndex;
				const active = i === currentIndex;
				const at = formatTimestamp(statusHistory, step);
				return (
					<li
						key={step}
						className="flex flex-1 flex-col items-center"
					>
						<div className="flex w-full items-center">
							{/* left connector */}
							<span
								className={cn(
									"h-0.5 flex-1",
									i === 0 && "invisible",
									i <= currentIndex
										? "bg-emerald-500"
										: "bg-gray-200",
								)}
							/>
							<span
								className={cn(
									"flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
									done && "bg-emerald-500 text-white",
									active &&
										"bg-brand-600 text-white ring-4 ring-brand-100",
									!done &&
										!active &&
										"bg-gray-100 text-gray-400",
								)}
							>
								{done ? (
									<Check
										className="size-4"
										aria-hidden="true"
									/>
								) : (
									i + 1
								)}
							</span>
							{/* right connector */}
							<span
								className={cn(
									"h-0.5 flex-1",
									i === ORDER_STATUS_FLOW.length - 1 &&
										"invisible",
									i < currentIndex
										? "bg-emerald-500"
										: "bg-gray-200",
								)}
							/>
						</div>
						<span
							className={cn(
								"mt-2 text-center text-xs",
								active
									? "font-semibold text-gray-900"
									: "text-muted",
							)}
						>
							{ORDER_STATUS_LABELS[step]}
						</span>
						{at && (
							<span className="mt-0.5 text-center text-[11px] text-muted">
								{at.toLocaleString("id-ID")}
							</span>
						)}
					</li>
				);
			})}
		</ol>
	);
}
