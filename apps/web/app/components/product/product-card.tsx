import { ImageOff, Store } from "lucide-react";
import type { CatalogProduct } from "@seapedia/shared";
import { formatRupiah } from "../../lib/format";

export function ProductCard({ product }: { product: CatalogProduct }) {
	const outOfStock = product.stock <= 0;
	return (
		<article className="overflow-hidden rounded-lg border bg-surface transition-shadow hover:shadow-card">
			<div className="flex h-32 items-center justify-center bg-gray-100 text-gray-400">
				{product.imageUrl ? (
					<img
						src={product.imageUrl}
						alt={product.name}
						className="h-full w-full object-cover"
						loading="lazy"
					/>
				) : (
					<ImageOff size={28} aria-hidden="true" />
				)}
			</div>
			<div className="p-2.5">
				<h3 className="line-clamp-1 text-xs leading-snug text-gray-900">
					{product.name}
				</h3>
				<div className="my-1 text-md font-semibold text-brand-600">
					{formatRupiah(product.price)}
				</div>
				<div className="flex items-center gap-1 text-[11px] text-muted">
					<Store size={12} aria-hidden="true" />
					{product.store.name}
				</div>
				<div className="mt-0.5 text-[11px] text-muted">
					{outOfStock ? (
						<span className="text-destructive">Out of stock</span>
					) : (
						<span>{product.stock} in stock</span>
					)}
				</div>
			</div>
		</article>
	);
}
