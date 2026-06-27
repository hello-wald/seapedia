import type { AdminProductRow } from "@seapedia/shared";
import type { Route } from "./+types/products";
import { tokenContext } from "~/.server/middleware";
import { getAdminProducts } from "~/.server/admin";
import { AdminTable } from "~/components/admin/admin-table";
import { TableCell, TableRow } from "~/components/ui/table";
import { formatRupiah } from "~/lib/format";

export function meta() {
	return [{ title: "Products · Admin · SEApedia" }];
}

export async function loader({ context }: Route.LoaderArgs) {
	const token = context.get(tokenContext);
	if (!token) return { products: [] as AdminProductRow[] };
	const products = await getAdminProducts(token);
	return { products: products ?? [] };
}

export default function AdminProducts({ loaderData }: Route.ComponentProps) {
	const { products } = loaderData;
	return (
		<div>
			<h1 className="text-xl font-semibold text-gray-900">Products</h1>
			<p className="mt-1 text-sm text-muted">{products.length} products</p>
			<AdminTable
				columns={["Product", "Store", "Price", "Stock"]}
				isEmpty={products.length === 0}
			>
				{products.map((p) => (
					<TableRow key={p.id}>
						<TableCell className="font-medium text-gray-900">
							{p.name}
						</TableCell>
						<TableCell className="text-gray-700">
							{p.storeName}
						</TableCell>
						<TableCell className="text-gray-700">
							{formatRupiah(p.price)}
						</TableCell>
						<TableCell>
							{p.stock <= 0 ? (
								<span className="text-destructive">
									Out of stock
								</span>
							) : p.stock < 10 ? (
								<span className="text-amber-600">
									{p.stock} (low)
								</span>
							) : (
								<span className="text-gray-700">{p.stock}</span>
							)}
						</TableCell>
					</TableRow>
				))}
			</AdminTable>
		</div>
	);
}
