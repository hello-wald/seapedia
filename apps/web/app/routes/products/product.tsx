import type { Route } from "./+types/product";
import { Link } from "react-router";
import { MapPin, Star, ShoppingCart, ArrowLeft } from "lucide-react";
import { allProducts } from "../../data/products";
import { formatRupiah } from "../../lib/format";
import { Button } from "../../components/ui/button";

export function meta({ params }: Route.MetaArgs) {
	const product = allProducts.find((p) => p.id === params.id);
	return [
		{
			title: product
				? `${product.name} · SEApedia`
				: "Product · SEApedia",
		},
	];
}

export default function ProductDetail({ params }: Route.ComponentProps) {
	// TODO (Level 2): replace with a loader + GET /api/products/:id
	const product = allProducts.find((p) => p.id === params.id);

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

	const Icon = product.icon;

	return (
		<main>
			<div className="mx-auto container max-w-4xl px-4 py-8">
				<Link
					to="/products"
					className="mb-6 inline-flex items-center gap-1.5 text-sm text-brand-700 hover:underline"
				>
					<ArrowLeft size={14} />
					Back to products
				</Link>

				<div className="grid gap-8 md:grid-cols-2">
					{/* Image / icon area */}
					<div
						className={`flex aspect-square items-center justify-center rounded-2xl ${product.tone}`}
					>
						<Icon size={96} aria-hidden="true" />
					</div>

					{/* Info */}
					<div className="flex flex-col">
						<h1 className="text-2xl font-semibold text-gray-900">
							{product.name}
						</h1>

						<div className="mt-3 flex items-center gap-3 text-sm text-muted">
							<span className="flex items-center gap-1">
								<Star
									size={14}
									className="fill-amber-400 text-amber-400"
									aria-hidden="true"
								/>
								{product.rating.toFixed(1)}
							</span>
							<span>·</span>
							<span>{product.sold} sold</span>
						</div>

						<div className="mt-4 text-3xl font-bold text-brand-700">
							{formatRupiah(product.price)}
						</div>

						<div className="mt-4 flex items-center gap-1.5 text-sm text-muted">
							<MapPin size={14} aria-hidden="true" />
							<span>
								{product.storeName} · {product.city}
							</span>
						</div>

						<div className="mt-auto pt-8">
							<Button size="lg" className="w-full gap-2">
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
