import { type LucideIcon, MapPin, Star } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  price: number;
  storeName: string;
  city: string;
  rating: number;
  sold: string;
  icon: LucideIcon;
  tone: string;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

export function ProductCard({ product }: { product: Product }) {
  const Icon = product.icon;
  return (
    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <div className={`flex h-24 items-center justify-center ${product.tone}`}>
        <Icon size={30} aria-hidden="true" />
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-2 h-9 text-xs leading-snug text-gray-800">
          {product.name}
        </h3>
        <div className="my-1 text-sm font-medium text-brand-700">
          {formatRupiah(product.price)}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <MapPin size={12} aria-hidden="true" />
          {product.storeName} · {product.city}
        </div>
        <div className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
          <Star size={12} className="fill-amber-400 text-amber-400" aria-hidden="true" />
          {product.rating.toFixed(1)} · {product.sold} sold
        </div>
      </div>
    </article>
  );
}
