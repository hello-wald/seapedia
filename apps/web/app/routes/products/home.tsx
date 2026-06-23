import type { Route } from "./+types/home";
import { Link } from "react-router";
import { getCatalog } from "../../.server/products";
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

export async function loader(_: Route.LoaderArgs) {
	const products = await getCatalog();
	return { products: products ?? [] };
}

export default function Products({ loaderData }: Route.ComponentProps) {
	const { products } = loaderData;

	return (
		<main className="mx-auto max-w-6xl px-4 py-8">
			<div className="mb-6 flex items-baseline justify-between">
				<h1 className="text-xl font-medium text-gray-900">
					All products
				</h1>
				<p className="mt-0.5 text-sm text-muted">
					{products.length} items
				</p>
			</div>

			{products.length === 0 ? (
				<p className="py-16 text-center text-sm text-muted">
					No products yet. Check back soon.
				</p>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
					{products.map((product) => (
						<Link key={product.id} to={`/products/${product.id}`}>
							<ProductCard product={product} />
						</Link>
					))}
				</div>
			)}
		</main>
	);
}
