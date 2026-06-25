import { Prisma } from "@prisma/client";

export const orderDetailInclude = {
	store: { select: { id: true, name: true, description: true } },
	buyer: { select: { name: true } },
	items: { orderBy: { name: "asc" } },
	statusHistory: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.OrderInclude;

export type OrderWithDetail = Prisma.OrderGetPayload<{
	include: typeof orderDetailInclude;
}>;

export function toOrderDetail(order: OrderWithDetail) {
	return {
		id: order.id,
		status: order.status,
		deliveryMethod: order.deliveryMethod,
		subtotal: order.subtotal,
		discount: order.discount,
		discountCode: order.discountCode,
		discountKind: order.discountKind,
		deliveryFee: order.deliveryFee,
		tax: order.tax,
		total: order.total,
		recipientName: order.recipientName,
		phone: order.phone,
		addressLine1: order.addressLine1,
		city: order.city,
		province: order.province,
		postalCode: order.postalCode,
		store: order.store,
		buyerName: order.buyer.name,
		items: order.items.map((i) => ({
			id: i.id,
			productId: i.productId,
			name: i.name,
			unitPrice: i.unitPrice,
			quantity: i.quantity,
			lineTotal: i.lineTotal,
		})),
		statusHistory: order.statusHistory.map((h) => ({
			id: h.id,
			status: h.status,
			createdAt: h.createdAt,
		})),
		createdAt: order.createdAt,
	};
}
