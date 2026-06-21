import type { Route } from "./+types/home";
import { Link } from "react-router";
import { allProducts } from "../../data/products";
import { ProductCard } from "../../components/product/product-card";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "Products · SEApedia" },
		{
			name: "description",
			content: "Browse products from sellers across Indonesia.",
		},
	];
}

export default function Products(_: Route.ComponentProps) {
	// TODO(L2): replace with a loader + GET /api/products
	const products = allProducts;

	return (
		<main>
			<div className="mx-auto max-w-6xl px-4 py-8">
				<div className="mb-6 flex items-baseline justify-between">
					<div>
						<h1 className="text-xl font-medium text-gray-900">
							All products
						</h1>
						<p className="mt-0.5 text-sm text-muted">
							{products.length} items
						</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{products.map((product) => (
						<Link key={product.id} to={`/products/${product.id}`}>
							<ProductCard product={product} />
						</Link>
					))}
				</div>
			</div>
		</main>
	);
}
