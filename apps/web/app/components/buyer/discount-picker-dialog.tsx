import { Check, TicketPercent } from "lucide-react";
import {
	DISCOUNT_KIND_LABELS,
	type AvailableDiscount,
} from "@seapedia/shared";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

export function DiscountPickerDialog({
	open,
	onOpenChange,
	discounts,
	selectedCode,
	onSelect,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	discounts: AvailableDiscount[];
	selectedCode: string | null;
	onSelect: (discount: AvailableDiscount) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Discount codes</DialogTitle>
					<DialogDescription>
						Pick a voucher or promo to apply to this order.
					</DialogDescription>
				</DialogHeader>

				{discounts.length === 0 ? (
					<div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted">
						No discount codes are available right now.
					</div>
				) : (
					<div className="max-h-[60vh] space-y-3 overflow-y-auto">
						{discounts.map((d) => {
							const active = d.code === selectedCode;
							return (
								<div
									key={`${d.kind}-${d.code}`}
									className={`rounded-lg border p-4 ${
										active ? "border-brand-600 bg-brand-50" : ""
									}`}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex min-w-0 gap-3">
											<TicketPercent
												className="mt-0.5 size-5 shrink-0 text-brand-600"
												aria-hidden="true"
											/>
											<div className="min-w-0">
												<div className="flex items-center gap-2">
													<span className="font-medium text-gray-900">
														{d.code}
													</span>
													<span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-900">
														{DISCOUNT_KIND_LABELS[d.kind]}
													</span>
												</div>
												<p className="mt-0.5 text-sm text-gray-700">
													Diskon {d.percent}%
												</p>
												<p className="mt-0.5 text-xs text-muted">
													Expires{" "}
													{new Date(
														d.expiresAt,
													).toLocaleDateString("id-ID")}
													{d.remaining !== null &&
														` · ${d.remaining} use${
															d.remaining === 1 ? "" : "s"
														} left`}
												</p>
											</div>
										</div>
										{active ? (
											<Check
												className="size-5 shrink-0 text-brand-600"
												aria-hidden="true"
											/>
										) : (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => {
													onSelect(d);
													onOpenChange(false);
												}}
											>
												Use
											</Button>
										)}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
