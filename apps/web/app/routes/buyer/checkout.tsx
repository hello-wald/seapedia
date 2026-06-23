import { useState } from "react";
import {
	Link,
	redirect,
	useActionData,
	useNavigation,
	useSubmit,
} from "react-router";
import { ImageOff, MapPin, Store, Wallet } from "lucide-react";
import {
	checkoutSchema,
	computeOrderTotals,
	DELIVERY_FEES,
	DELIVERY_METHOD_LABELS,
	deliveryMethodSchema,
	PPN_RATE,
	type DeliveryMethod,
} from "@seapedia/shared";
import type { Route } from "./+types/checkout";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { ErrorBanner } from "~/components/ui/form-banner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { AddressPickerDialog } from "~/components/buyer/address-picker-dialog";
import { tokenContext } from "~/.server/middleware";
import { getCart } from "~/.server/cart";
import { getAddresses } from "~/.server/addresses";
import { getWallet } from "~/.server/wallet";
import { checkout } from "~/.server/orders";
import { formatRupiah } from "~/lib/format";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

const DELIVERY_METHODS = deliveryMethodSchema.options;

export function meta() {
	return [{ title: "Checkout · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");
	const [summary, addresses, wallet] = await Promise.all([
		getCart(token),
		getAddresses(token),
		getWallet(token),
	]);
	// Nothing to check out
	if (!summary || summary.items.length === 0) {
		throw redirect("/cart");
	}
	return {
		summary,
		addresses: addresses ?? [],
		balance: wallet?.balance ?? 0,
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");

	const formData = await request.formData();
	const parsed = checkoutSchema.safeParse({
		addressId: formData.get("addressId"),
		deliveryMethod: formData.get("deliveryMethod"),
	});
	if (!parsed.success) {
		return {
			ok: false,
			formError: parsed.error.issues.map((i) => i.message).join(", "),
		};
	}

	const result = await checkout(token, parsed.data);
	if (!result.ok) {
		return { ok: false, formError: result.error };
	}
	throw redirect(`/buyer/orders/${result.data.id}`);
}

export default function Checkout({ loaderData }: Route.ComponentProps) {
	const { summary, addresses, balance } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const submit = useSubmit();
	const submitting = navigation.state === "submitting";

	const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
	const [addressId, setAddressId] = useState(defaultAddress?.id ?? "");
	const [method, setMethod] = useState<DeliveryMethod>("REGULAR");
	const [addrOpen, setAddrOpen] = useState(false);
	const [confirmOpen, setConfirmOpen] = useState(false);

	const totals = computeOrderTotals(summary.subtotal, method);
	const selected =
		addresses.find((a) => a.id === addressId) ?? defaultAddress;

	const placeOrder = () => {
		setConfirmOpen(false);
		submit({ addressId, deliveryMethod: method }, { method: "post" });
	};

	if (addresses.length === 0) {
		return (
			<main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-4">
				<h1 className="text-xl font-semibold text-gray-900">
					Checkout
				</h1>
				<div className="rounded-lg border border-dashed p-8 text-center">
					<p className="font-medium text-gray-700">
						You need a delivery address first.
					</p>
					<p className="mt-1 text-sm text-muted">
						Add an address before checking out.
					</p>
					<Link to="/buyer/addresses" className="mt-4 inline-block">
						<Button>Add an address</Button>
					</Link>
				</div>
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-6xl px-4 py-8 space-y-6">
			<h1 className="text-xl font-semibold text-gray-900">Checkout</h1>

			{actionData && !actionData.ok && actionData.formError && (
				<ErrorBanner>{actionData.formError}</ErrorBanner>
			)}

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
				<div className="space-y-6">
					{/* Delivery address */}
					<Card className="p-5">
						<p className="text-xs font-semibold uppercase tracking-wide text-muted">
							Delivery address
						</p>
						<div className="mt-3 flex items-start justify-between gap-2">
							<div className="min-w-0">
								<div className="font-semibold text-gray-900 flex items-center gap-1">
									<MapPin size={20} />
									{selected.label} · {selected.recipientName}
									{selected.isDefault && (
										<span className="rounded bg-brand-100 px-1.5 py-0.5 text-xs font-normal text-brand-900 ml-1">
											Default
										</span>
									)}
								</div>
								<p className="mt-2 text-sm text-gray-700">
									{selected.phone}
								</p>
								<p className="mt-0.5 text-sm text-muted">
									{selected.line1}, {selected.city},{" "}
									{selected.province} {selected.postalCode}
								</p>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => setAddrOpen(true)}
							>
								Change
							</Button>
						</div>
					</Card>

					{/* Store + items */}
					<Card className="p-5">
						<div className="flex items-center gap-2">
							<Store
								className="text-brand-600"
								aria-hidden="true"
								size={20}
							/>
							<h2 className="font-semibold text-gray-900">
								{summary.store?.name}
							</h2>
						</div>
						<ul className="mt-2  divide-y divide-border">
							{summary.items.map((item) => (
								<li
									key={item.id}
									className="flex items-center gap-3 py-3"
								>
									<div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
										{item.imageUrl ? (
											<img
												src={item.imageUrl}
												alt={item.name}
												className="h-full w-full object-cover"
											/>
										) : (
											<ImageOff
												size={22}
												aria-hidden="true"
											/>
										)}
									</div>
									<div className="flex min-w-0 flex-1 items-start justify-between gap-3">
										<p className="line-clamp-2 text-sm text-gray-900">
											{item.name}
										</p>
										<p className="shrink-0 text-sm font-medium text-gray-700">
											{item.quantity} ×{" "}
											{formatRupiah(item.price)}
										</p>
									</div>
								</li>
							))}
						</ul>

						{/* Delivery method */}
						<div className="flex items-center justify-between mt-2">
							<label
								htmlFor="deliveryMethod"
								className="text-sm font-semibold text-gray-900 shrink-0"
							>
								Delivery method
							</label>

							<Select
								value={method}
								onValueChange={(value) =>
									setMethod(value as DeliveryMethod)
								}
							>
								<SelectTrigger
									id="deliveryMethod"
									className="w-full max-w-1/2 md:max-w-1/3"
								>
									<SelectValue>
										{DELIVERY_METHOD_LABELS[method]} (
										{formatRupiah(DELIVERY_FEES[method])})
									</SelectValue>
								</SelectTrigger>

								<SelectContent>
									<SelectGroup>
										<SelectLabel>
											Delivery Methods
										</SelectLabel>

										{DELIVERY_METHODS.map((m) => (
											<SelectItem key={m} value={m}>
												{DELIVERY_METHOD_LABELS[m]} (
												{formatRupiah(DELIVERY_FEES[m])}
												)
											</SelectItem>
										))}
									</SelectGroup>
								</SelectContent>
							</Select>
						</div>
					</Card>
				</div>

				{/* Payment summary */}
				<Card className="h-fit p-5 lg:sticky lg:top-6">
					<h2 className="font-semibold text-gray-900">Payment</h2>
					<div className="mt-3 flex items-center justify-between rounded-lg border p-3">
						<span className="flex items-center gap-2 text-sm font-medium text-gray-900">
							<Wallet
								className="size-4 text-brand-600"
								aria-hidden="true"
							/>
							Wallet
						</span>
						<span className="text-sm text-gray-700">
							{formatRupiah(balance)}
						</span>
					</div>

					<dl className="mt-4 space-y-2 text-sm">
						<div className="flex justify-between">
							<dt className="text-muted">Subtotal</dt>
							<dd className="text-gray-900">
								{formatRupiah(totals.subtotal)}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-muted">
								Delivery ({DELIVERY_METHOD_LABELS[method]})
							</dt>
							<dd className="text-gray-900">
								{formatRupiah(totals.deliveryFee)}
							</dd>
						</div>
						<div className="flex justify-between">
							<dt className="text-muted">
								PPN ({Math.round(PPN_RATE * 100)}%)
							</dt>
							<dd className="text-gray-900">
								{formatRupiah(totals.tax)}
							</dd>
						</div>
						<div className="flex justify-between border-t mt-3 pt-3">
							<dt className="font-semibold text-gray-900">
								Total
							</dt>
							<dd className="text-lg font-bold text-gray-900">
								{formatRupiah(totals.total)}
							</dd>
						</div>
					</dl>

					<Button
						type="button"
						className="mt-5 w-full"
						disabled={submitting || !addressId}
						onClick={() => setConfirmOpen(true)}
					>
						{submitting ? "Placing order…" : "Pay & place order"}
					</Button>
					<p className="mt-2 text-center text-xs text-muted">
						Paid from your wallet balance.
					</p>
				</Card>
			</div>

			<AddressPickerDialog
				open={addrOpen}
				onOpenChange={setAddrOpen}
				addresses={addresses}
				selectedId={addressId}
				onSelect={setAddressId}
			/>

			<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Confirm your order</DialogTitle>
						<DialogDescription>
							Pay {formatRupiah(totals.total)} from your wallet
							for {summary.totalItems}{" "}
							{summary.totalItems === 1 ? "item" : "items"} from{" "}
							{summary.store?.name}?
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							onClick={placeOrder}
							disabled={submitting}
						>
							Confirm &amp; pay
						</Button>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setConfirmOpen(false)}
						>
							Cancel
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
}
