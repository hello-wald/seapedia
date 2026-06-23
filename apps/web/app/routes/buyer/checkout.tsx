import { useState } from "react";
import {
	Form,
	Link,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
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
import { tokenContext } from "~/.server/middleware";
import { getCart } from "~/.server/cart";
import { getAddresses } from "~/.server/addresses";
import { checkout } from "~/.server/orders";
import { formatRupiah } from "~/lib/format";

const DELIVERY_METHODS = deliveryMethodSchema.options;

export function meta() {
	return [{ title: "Checkout · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");
	const [summary, addresses] = await Promise.all([
		getCart(token),
		getAddresses(token),
	]);
	// Nothing to check out
	if (!summary || summary.items.length === 0) {
		throw redirect("/cart");
	}
	return { summary, addresses: addresses ?? [] };
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
	const { summary, addresses } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const submitting = navigation.state === "submitting";

	const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0];
	const [addressId, setAddressId] = useState(defaultAddress?.id ?? "");
	const [method, setMethod] = useState<DeliveryMethod>("REGULAR");

	const totals = computeOrderTotals(summary.subtotal, method);

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
			<div>
				<h1 className="text-xl font-semibold text-gray-900">
					Checkout
				</h1>
				<p className="mt-1 text-sm text-muted">
					Review your order from {summary.store?.name} before
					confirming.
				</p>
			</div>

			{actionData && !actionData.ok && actionData.formError && (
				<ErrorBanner>{actionData.formError}</ErrorBanner>
			)}

			<Form
				method="post"
				className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]"
			>
				<div className="space-y-6">
					{/* Delivery address */}
					<Card className="p-5">
						<h2 className="text-sm font-semibold text-gray-900">
							Delivery address
						</h2>
						<div className="mt-3 space-y-2">
							{addresses.map((a) => (
								<label
									key={a.id}
									className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${
										addressId === a.id
											? "border-brand-600 bg-brand-50"
											: "hover:bg-gray-50"
									}`}
								>
									<input
										type="radio"
										name="addressId"
										value={a.id}
										checked={addressId === a.id}
										onChange={() => setAddressId(a.id)}
										className="mt-1 size-4"
									/>
									<span className="text-sm">
										<span className="font-medium text-gray-900">
											{a.label}
											{a.isDefault && (
												<span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-xs text-brand-900">
													Default
												</span>
											)}
										</span>
										<span className="mt-0.5 block text-gray-700">
											{a.recipientName} · {a.phone}
										</span>
										<span className="block text-muted">
											{a.line1}, {a.city}, {a.province}{" "}
											{a.postalCode}
										</span>
									</span>
								</label>
							))}
						</div>
					</Card>

					{/* Delivery method */}
					<Card className="p-5">
						<h2 className="text-sm font-semibold text-gray-900">
							Delivery method
						</h2>
						<div className="mt-3 space-y-2">
							{DELIVERY_METHODS.map((m) => (
								<label
									key={m}
									className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 ${
										method === m
											? "border-brand-600 bg-brand-50"
											: "hover:bg-gray-50"
									}`}
								>
									<span className="flex items-center gap-3">
										<input
											type="radio"
											name="deliveryMethod"
											value={m}
											checked={method === m}
											onChange={() => setMethod(m)}
											className="size-4"
										/>
										<span className="text-sm font-medium text-gray-900">
											{DELIVERY_METHOD_LABELS[m]}
										</span>
									</span>
									<span className="text-sm text-gray-700">
										{formatRupiah(DELIVERY_FEES[m])}
									</span>
								</label>
							))}
						</div>
					</Card>

					{/* Items */}
					<Card className="p-5">
						<h2 className="text-sm font-semibold text-gray-900">
							Items
						</h2>
						<ul className="mt-3 divide-y">
							{summary.items.map((item) => (
								<li
									key={item.id}
									className="flex justify-between gap-4 py-2 text-sm"
								>
									<span className="text-gray-900">
										{item.name}{" "}
										<span className="text-muted">
											× {item.quantity}
										</span>
									</span>
									<span className="text-gray-700">
										{formatRupiah(item.lineTotal)}
									</span>
								</li>
							))}
						</ul>
					</Card>
				</div>

				{/* Summary */}
				<Card className="h-fit p-5 lg:sticky lg:top-6">
					<h2 className="text-sm font-semibold text-gray-900">
						Payment summary
					</h2>
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
						<div className="flex justify-between border-t pt-3">
							<dt className="font-semibold text-gray-900">
								Total
							</dt>
							<dd className="text-lg font-bold text-gray-900">
								{formatRupiah(totals.total)}
							</dd>
						</div>
					</dl>
					<Button
						type="submit"
						className="mt-5 w-full"
						disabled={submitting || !addressId}
					>
						{submitting ? "Placing order…" : "Pay & place order"}
					</Button>
					<p className="mt-2 text-center text-xs text-muted">
						Paid from your wallet balance.
					</p>
				</Card>
			</Form>
		</main>
	);
}
