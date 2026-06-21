import type { Route } from "./+types/product";
import { Link } from "react-router";
import { ImageOff, MapPin, Store, ShoppingCart, ArrowLeft } from "lucide-react";
import { getCatalogProduct } from "../../.server/products";
import { formatRupiah } from "../../lib/format";
import { Button } from "../../components/ui/button";

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

export default function ProductDetail({ loaderData }: Route.ComponentProps) {
	const { product } = loaderData;

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

				<div className="grid gap-8 md:grid-cols-2">
					{/* Image area */}
					<div className="flex aspect-square items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-gray-400">
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
						<h1 className="text-2xl font-semibold text-gray-900">
							{product.name}
						</h1>

						<div className="mt-4 text-3xl font-bold text-brand-700">
							{formatRupiah(product.price)}
						</div>

						<div className="mt-2 text-sm text-muted">
							{outOfStock ? (
								<span className="text-destructive">
									Out of stock
								</span>
							) : (
								<span>{product.stock} in stock</span>
							)}
						</div>

						{product.description && (
							<p className="mt-4 text-sm leading-relaxed text-gray-700">
								{product.description}
							</p>
						)}

						{/* Store info block */}
						<div className="mt-6 rounded-xl border bg-surface p-4">
							<div className="flex items-center gap-2 text-sm font-medium text-gray-900">
								<Store size={16} aria-hidden="true" />
								{product.store.name}
							</div>
							{product.store.description && (
								<p className="mt-1.5 text-xs leading-relaxed text-muted">
									{product.store.description}
								</p>
							)}
							<div className="mt-2 flex items-center gap-1.5 text-xs text-muted">
								<MapPin size={12} aria-hidden="true" />
								Sold by {product.store.name}
							</div>
						</div>

						<div className="pt-8">
							<Button
								size="lg"
								className="w-full gap-2"
								disabled={outOfStock}
							>
								<ShoppingCart size={18} aria-hidden="true" />
								Add to cart
							</Button>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
