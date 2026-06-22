import type { Route } from "./+types/product";
import { useState } from "react";
import {
	Form,
	Link,
	redirect,
	useActionData,
	useNavigation,
} from "react-router";
import { toast } from "sonner";
import {
	ImageOff,
	Store,
	ShoppingCart,
	ArrowLeft,
	Package,
	Minus,
	Plus,
} from "lucide-react";
import { addToCartSchema } from "@seapedia/shared";
import { getCatalogProduct } from "../../.server/products";
import { addToCart } from "../../.server/cart";
import { tokenContext } from "../../.server/middleware";
import { formatRupiah } from "../../lib/format";
import { Button } from "../../components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../../components/ui/dialog";
import { useActionFeedback } from "../../lib/hooks/use-action-feedback";

export function meta({ loaderData }: Route.MetaArgs) {
	const product = loaderData?.product;
	return [
		{
			title: product
				? `${product.name} · SEApedia`
				: "Product · SEApedia",
		},
	];
}

export async function loader({ params }: Route.LoaderArgs) {
	const product = await getCatalogProduct(params.id);
	return { product };
}

export async function action({ request, context }: Route.ActionArgs) {
	const token = context.get(tokenContext);
	if (!token) throw redirect("/login");

	const formData = await request.formData();
	const parsed = addToCartSchema.safeParse({
		productId: formData.get("productId"),
		quantity: formData.get("quantity"),
		replace: formData.get("replace") === "true" ? true : undefined,
	});
	if (!parsed.success) {
		return {
			ok: false as const,
			formError: parsed.error.issues.map((i) => i.message).join(", "),
		};
	}

	const result = await addToCart(token, parsed.data);
	if (result.ok) {
		return { ok: true as const, message: "Added to cart" };
	}
	if ("conflict" in result) {
		return {
			ok: false as const,
			conflict: true as const,
			currentStoreName: result.currentStoreName,
			productId: parsed.data.productId,
			quantity: parsed.data.quantity,
		};
	}
	return { ok: false as const, formError: result.error };
}

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
	const { product } = loaderData;
	const actionData = useActionData<typeof action>();
	const navigation = useNavigation();
	const submitting = navigation.state === "submitting";

	const [quantity, setQuantity] = useState(1);
	const [replaceOpen, setReplaceOpen] = useState(false);

	useActionFeedback(actionData, {
		successFallback: "Added to cart",
		onSuccess: () => setReplaceOpen(false),
		onError: (data) => {
			if ("conflict" in data && data.conflict) {
				setReplaceOpen(true);
			} else if ("formError" in data && data.formError) {
				toast.error(data.formError);
			}
		},
	});

	if (!product) {
		return (
			<main className="flex flex-1 flex-col items-center justify-center gap-4">
				<p className="text-lg font-medium text-gray-900">
					Product not found
				</p>
				<Link
					to="/products"
					className="text-sm text-brand-700 hover:underline"
				>
					← Back to products
				</Link>
			</main>
		);
	}

	const outOfStock = product.stock <= 0;
	const subtotal = product.price * quantity;
	const conflictStore =
		actionData && "conflict" in actionData
			? actionData.currentStoreName
			: undefined;

	const decrease = () => setQuantity((q) => Math.max(1, q - 1));
	const increase = () => setQuantity((q) => Math.min(product.stock, q + 1));

	return (
		<main>
			<div className="mx-auto max-w-6xl px-4 py-8 mb-8">
				<Link
					to="/products"
					className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"
				>
					<ArrowLeft size={14} />
					Back to products
				</Link>

				<div className="grid gap-8 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)_300px]">
					{/* Image area */}
					<div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-gray-400 border">
						{product.imageUrl ? (
							<img
								src={product.imageUrl}
								alt={product.name}
								className="h-full w-full object-cover"
							/>
						) : (
							<ImageOff size={96} aria-hidden="true" />
						)}
					</div>

					{/* Info */}
					<div className="flex flex-col">
						<div className="h-fit rounded-xl border bg-surface p-5">
							<h1 className="text-2xl font-semibold text-gray-900">
								{product.name}
							</h1>

							<div className="mt-4 text-3xl font-bold text-brand-600">
								{formatRupiah(product.price)}
							</div>

							<div className="mt-2 text-sm text-muted flex items-center gap-1">
								{outOfStock ? (
									<span className="text-destructive">
										Out of stock
									</span>
								) : (
									<>
										<Package size={16} />
										<span>{product.stock} in stock</span>
									</>
								)}
							</div>

							{product.description && (
								<p className="mt-4 text-sm leading-relaxed text-gray-700">
									{product.description}
								</p>
							)}
						</div>

						{/* Store info block */}
						<div className="mt-6 flex rounded-xl border bg-surface p-4 items-center gap-3">
							<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
								<Store size={20} aria-hidden="true" />
							</div>
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold text-gray-900">
									{product.store.name}
								</p>
								{product.store.description && (
									<p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
										<span className="truncate">
											{product.store.description}
										</span>
									</p>
								)}
							</div>
						</div>
					</div>

					<div className="lg:sticky lg:top-6 h-fit rounded-xl border bg-surface p-5">
						<h2 className="text-sm font-semibold text-gray-900">
							Set quantity
						</h2>

						<div className="mt-4 flex items-center gap-3">
							<div className="flex items-center rounded-md border border-border-strong">
								<button
									type="button"
									onClick={decrease}
									disabled={outOfStock || quantity <= 1}
									aria-label="Decrease quantity"
									className="flex h-9 w-9 items-center justify-center text-brand-600 disabled:text-muted-subtle disabled:pointer-events-none"
								>
									<Minus size={16} />
								</button>
								<span className="w-10 text-center text-sm font-medium text-gray-900">
									{quantity}
								</span>
								<button
									type="button"
									onClick={increase}
									disabled={
										outOfStock || quantity >= product.stock
									}
									aria-label="Increase quantity"
									className="flex h-9 w-9 items-center justify-center text-brand-600 disabled:text-muted-subtle disabled:pointer-events-none"
								>
									<Plus size={16} />
								</button>
							</div>
							<p className="text-sm text-muted">
								Stock:{" "}
								<span className="font-medium text-gray-900">
									{product.stock}
								</span>
							</p>
						</div>

						<div className="mt-4 flex items-center justify-between">
							<span className="text-sm text-muted">Subtotal</span>
							<span className="text-lg font-bold text-gray-900">
								{formatRupiah(subtotal)}
							</span>
						</div>

						<Form method="post" className="mt-4">
							<input
								type="hidden"
								name="productId"
								value={product.id}
							/>
							<input
								type="hidden"
								name="quantity"
								value={quantity}
							/>
							<Button
								type="submit"
								size="lg"
								className="w-full gap-2"
								disabled={outOfStock || submitting}
							>
								<ShoppingCart size={18} aria-hidden="true" />
								{submitting ? "Adding…" : "Add to cart"}
							</Button>
						</Form>
					</div>
				</div>
			</div>

			{/* Offer to replace the cart */}
			<Dialog open={replaceOpen} onOpenChange={setReplaceOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Start a new cart?</DialogTitle>
						<DialogDescription>
							Your cart already contains items from{" "}
							<span className="font-medium text-gray-900">
								{conflictStore}
							</span>
							. A cart can only hold products from one store.
							Replacing will empty your cart and add this item
							instead.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Form method="post">
							<input
								type="hidden"
								name="productId"
								value={product.id}
							/>
							<input
								type="hidden"
								name="quantity"
								value={quantity}
							/>
							<input type="hidden" name="replace" value="true" />
							<Button
								type="submit"
								disabled={submitting}
								className="w-full"
							>
								{submitting ? "Replacing…" : "Replace cart"}
							</Button>
						</Form>
						<Button
							type="button"
							variant="ghost"
							onClick={() => setReplaceOpen(false)}
							disabled={submitting}
						>
							Keep current cart
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	);
}
