import type { Route } from "./+types/cart";
import {
	Form,
	Link,
	redirect,
	useActionData,
	useNavigation,
	useSubmit,
} from "react-router";
import { ImageOff, Minus, Plus, Store, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateCartItemSchema } from "@seapedia/shared";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { tokenContext } from "~/.server/middleware";
import {
	clearCart,
	getCart,
	removeCartItem,
	updateCartItem,
} from "~/.server/cart";
import { formatRupiah } from "~/lib/format";
import { useActionFeedback } from "~/lib/hooks/use-action-feedback";

const EMPTY = { store: null, items: [], subtotal: 0, totalItems: 0 } as const;

export function meta() {
	return [{ title: "Cart · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { summary: EMPTY };
	const summary = await getCart(token);
	return { summary: summary ?? EMPTY };
}

export async function action({ request, context }: Route.ActionArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");

	const formData = await request.formData();
	const intent = String(formData.get("intent"));

	if (intent === "clear") {
		const result = await clearCart(token);
		return result.ok
			? { ok: true, intent, message: "Cart emptied", formError: null }
			: { ok: false, intent, message: null, formError: result.error };
	}

	if (intent === "remove") {
		const result = await removeCartItem(
			token,
			String(formData.get("itemId")),
		);
		return result.ok
			? { ok: true, intent, message: "Item removed", formError: null }
			: { ok: false, intent, message: null, formError: result.error };
	}

	if (intent === "update") {
		const parsed = updateCartItemSchema.safeParse({
			quantity: formData.get("quantity"),
		});
		if (!parsed.success) {
			return {
				ok: false,
				intent,
				message: null,
				formError: parsed.error.issues.map((i) => i.message).join(", "),
			};
		}
		const result = await updateCartItem(
			token,
			String(formData.get("itemId")),
			parsed.data.quantity,
		);
		return result.ok
			? { ok: true, intent, message: null, formError: null }
			: { ok: false, intent, message: null, formError: result.error };
	}

	return { ok: false, intent, message: null, formError: "Unknown action" };
}

export default function BuyerCart({ loaderData }: Route.ComponentProps) {
	const { summary } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const submit = useSubmit();
	const busy = navigation.state !== "idle";

	useActionFeedback(actionData, {
		onError: (data) => data.formError && toast.error(data.formError),
	});

	const setQuantity = (itemId: string, quantity: number) => {
		const fd = new FormData();
		fd.set("intent", "update");
		fd.set("itemId", itemId);
		fd.set("quantity", String(quantity));
		submit(fd, { method: "post" });
	};

	if (summary.items.length === 0) {
		return (
			<div className="space-y-6">
				<Header />
				<div className="rounded-lg border border-dashed p-10 text-center">
					<p className="font-medium text-gray-700">
						Your cart is empty.
					</p>
					<p className="mt-1 text-sm text-muted">
						Browse the catalog and add products to get started.
					</p>
					<Link to="/products" className="mt-4 inline-block">
						<Button variant="outline">Browse products</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<Header />

			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
				<div className="space-y-4">
					{summary.store && (
						<Card className="flex items-center gap-3 p-4">
							<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
								<Store size={18} aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold text-gray-900">
									{summary.store.name}
								</p>
								<p className="text-xs text-muted">
									A cart can only hold products from one
									store.
								</p>
							</div>
						</Card>
					)}

					{summary.items.map((item) => (
						<Card key={item.id} className="flex gap-4 p-4">
							<div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100 text-gray-400">
								{item.imageUrl ? (
									<img
										src={item.imageUrl}
										alt={item.name}
										className="h-full w-full object-cover"
									/>
								) : (
									<ImageOff size={28} aria-hidden="true" />
								)}
							</div>

							<div className="flex min-w-0 flex-1 flex-col">
								<Link
									to={`/products/${item.productId}`}
									className="truncate text-sm font-medium text-gray-900 hover:text-brand-700"
								>
									{item.name}
								</Link>
								<p className="mt-0.5 text-sm text-muted">
									{formatRupiah(item.price)}
								</p>

								<div className="mt-auto flex items-center justify-between gap-2 pt-2">
									<div className="flex gap-3 items-center justify-center">
										<div className="flex items-center rounded-md border border-border-strong">
											<button
												type="button"
												onClick={() =>
													setQuantity(
														item.id,
														item.quantity - 1,
													)
												}
												disabled={
													busy || item.quantity <= 1
												}
												aria-label="Decrease quantity"
												className="flex h-8 w-8 items-center justify-center text-brand-600 disabled:text-muted-subtle disabled:pointer-events-none"
											>
												<Minus size={14} />
											</button>
											<span className="w-9 text-center text-sm font-medium text-gray-900">
												{item.quantity}
											</span>
											<button
												type="button"
												onClick={() =>
													setQuantity(
														item.id,
														item.quantity + 1,
													)
												}
												disabled={
													busy ||
													item.quantity >= item.stock
												}
												aria-label="Increase quantity"
												className="flex h-8 w-8 items-center justify-center text-brand-600 disabled:text-muted-subtle disabled:pointer-events-none"
											>
												<Plus size={14} />
											</button>
										</div>
										<Form
											method="post"
											className="shrink-0 h-5"
										>
											<input
												type="hidden"
												name="intent"
												value="remove"
											/>
											<input
												type="hidden"
												name="itemId"
												value={item.id}
											/>
											<button
												type="submit"
												disabled={busy}
												aria-label="Remove item"
												className="text-muted transition-colors hover:text-destructive disabled:pointer-events-none"
											>
												<Trash2 size={18} />
											</button>
										</Form>
									</div>

									<p className="text-sm font-semibold text-gray-900">
										{formatRupiah(item.lineTotal)}
									</p>
								</div>
							</div>
						</Card>
					))}

					<Form method="post">
						<input type="hidden" name="intent" value="clear" />
						<Button
							type="submit"
							variant="ghost"
							size="sm"
							disabled={busy}
						>
							Clear cart
						</Button>
					</Form>
				</div>

				{/* Summary */}
				<Card className="h-fit p-5 lg:sticky lg:top-6">
					<h2 className="text-sm font-semibold text-gray-900">
						Order summary
					</h2>
					<div className="mt-4 flex justify-between text-sm text-muted">
						<span>Total items</span>
						<span className="text-gray-900">
							{summary.totalItems}
						</span>
					</div>
					<div className="mt-2 flex items-center justify-between">
						<span className="text-sm text-muted">Subtotal</span>
						<span className="text-lg font-bold text-gray-900">
							{formatRupiah(summary.subtotal)}
						</span>
					</div>
					<Button
						className="mt-5 w-full"
						disabled
						title="Coming in a later level"
					>
						Checkout
					</Button>
					<p className="mt-2 text-center text-xs text-muted">
						Checkout arrives in a later level.
					</p>
				</Card>
			</div>
		</div>
	);
}

function Header() {
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Your cart</h1>
			<p className="mt-1 text-sm text-muted">
				Review your items before checkout.
			</p>
		</div>
	);
}
