import { MapPin, Star } from "lucide-react";
import { formatRupiah } from "../../lib/format";
import type { ProductDisplay } from "../../data/products";

export function ProductCard({ product }: { product: ProductDisplay }) {
	const Icon = product.icon;
	return (
		<article className="overflow-hidden rounded-lg border bg-surface transition-shadow hover:shadow-card">
			<div
				className={`flex h-24 items-center justify-center ${product.tone}`}
			>
				<Icon size={30} aria-hidden="true" />
			</div>
			<div className="p-2.5">
				<h3 className="line-clamp-2 h-9 text-xs leading-snug text-gray-900">
					{product.name}
				</h3>
				<div className="my-1 text-sm font-medium text-brand-700">
					{formatRupiah(product.price)}
				</div>
				<div className="flex items-center gap-1 text-[11px] text-muted">
					<MapPin size={12} aria-hidden="true" />
					{product.storeName} · {product.city}
				</div>
				<div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
					<Star
						size={12}
						className="fill-amber-400 text-amber-400"
						aria-hidden="true"
					/>
					{product.rating.toFixed(1)} · {product.sold} sold
				</div>
			</div>
		</article>
	);
}
