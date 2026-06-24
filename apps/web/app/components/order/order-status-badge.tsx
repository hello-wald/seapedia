import { ORDER_STATUS_LABELS, type OrderStatus } from "@seapedia/shared";

const STATUS_STYLES: Record<OrderStatus, string> = {
	SEDANG_DIKEMAS: "bg-amber-100 text-amber-800",
	MENUNGGU_PENGIRIM: "bg-indigo-100 text-indigo-800",
	DIKIRIM: "bg-blue-100 text-blue-800",
	SELESAI: "bg-emerald-100 text-emerald-800",
	DIBATALKAN: "bg-red-100 text-red-800",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
	return (
		<span
			className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
		>
			{ORDER_STATUS_LABELS[status]}
		</span>
	);
}
