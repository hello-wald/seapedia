import { Check } from "lucide-react";
import type { Address } from "@seapedia/shared";
import { Button } from "~/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";

export function AddressPickerDialog({
	open,
	onOpenChange,
	addresses,
	selectedId,
	onSelect,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	addresses: Address[];
	selectedId: string;
	onSelect: (id: string) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Choose delivery address</DialogTitle>
				</DialogHeader>
				<div className="max-h-[60vh] space-y-3 overflow-y-auto">
					{addresses.map((a) => {
						const active = a.id === selectedId;
						return (
							<div
								key={a.id}
								className={`rounded-lg border p-4 ${
									active ? "border-brand-600 bg-brand-50" : ""
								}`}
							>
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<span className="font-medium text-gray-900">
												{a.label}
											</span>
											{a.isDefault && (
												<span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-900">
													Default
												</span>
											)}
										</div>
										<p className="mt-0.5 text-sm text-gray-700">
											{a.recipientName} · {a.phone}
										</p>
										<p className="mt-0.5 text-sm text-muted">
											{a.line1}, {a.city}, {a.province}{" "}
											{a.postalCode}
										</p>
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
												onSelect(a.id);
												onOpenChange(false);
											}}
										>
											Select
										</Button>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</DialogContent>
		</Dialog>
	);
}
