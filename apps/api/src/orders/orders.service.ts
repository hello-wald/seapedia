import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { type CheckoutInput, computeOrderTotals } from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";
import type { JwtPayload } from "../auth/jwt.types";

// Everything needed to map an order to the shared Order shape.
const orderDetailInclude = {
	store: { select: { id: true, name: true, description: true } },
	buyer: { select: { name: true } },
	items: { orderBy: { name: "asc" } },
	statusHistory: { orderBy: { createdAt: "asc" } },
} satisfies Prisma.OrderInclude;

type OrderWithDetail = Prisma.OrderGetPayload<{
	include: typeof orderDetailInclude;
}>;

@Injectable()
export class OrdersService {
	constructor(private readonly prisma: PrismaService) {}

	// Checkout: charge the wallet, reduce stock, record history.
	async checkout(userId: string, dto: CheckoutInput) {
		const address = await this.prisma.address.findFirst({
			where: { id: dto.addressId, userId },
		});
		if (!address) {
			throw new NotFoundException("Delivery address not found");
		}

		const orderId = await this.prisma.$transaction(async (tx) => {
			const cart = await tx.cart.findUnique({
				where: { userId },
				include: { items: { include: { product: true } } },
			});
			if (!cart || cart.items.length === 0) {
				throw new BadRequestException("Your cart is empty");
			}

			// Single-store rule
			const storeIds = new Set(cart.items.map((i) => i.product.storeId));
			if (storeIds.size > 1) {
				throw new BadRequestException(
					"A cart can only be checked out one store at a time",
				);
			}
			const storeId = cart.items[0].product.storeId;

			const subtotal = cart.items.reduce(
				(sum, i) => sum + i.product.price * i.quantity,
				0,
			);
			const { deliveryFee, tax, total } = computeOrderTotals(
				subtotal,
				dto.deliveryMethod,
			);

			// Wallet must cover the full total
			const buyer = await tx.user.findUniqueOrThrow({
				where: { id: userId },
				select: { balance: true },
			});
			if (buyer.balance < total) {
				throw new ForbiddenException(
					"Insufficient wallet balance for this order",
				);
			}

			// Safe stock reduction: `stock >= quantity` guard.
			for (const item of cart.items) {
				const res = await tx.product.updateMany({
					where: {
						id: item.productId,
						stock: { gte: item.quantity },
					},
					data: { stock: { decrement: item.quantity } },
				});
				if (res.count === 0) {
					throw new BadRequestException(
						`Not enough stock for "${item.product.name}"`,
					);
				}
			}

			const updatedBuyer = await tx.user.update({
				where: { id: userId },
				data: { balance: { decrement: total } },
				select: { balance: true },
			});

			const order = await tx.order.create({
				data: {
					buyerId: userId,
					storeId,
					deliveryMethod: dto.deliveryMethod,
					subtotal,
					deliveryFee,
					tax,
					total,
					recipientName: address.recipientName,
					phone: address.phone,
					addressLine1: address.line1,
					city: address.city,
					province: address.province,
					postalCode: address.postalCode,
					items: {
						create: cart.items.map((i) => ({
							productId: i.productId,
							name: i.product.name,
							unitPrice: i.product.price,
							quantity: i.quantity,
							lineTotal: i.product.price * i.quantity,
						})),
					},
					statusHistory: { create: [{ status: "SEDANG_DIKEMAS" }] },
				},
			});

			await tx.walletTransaction.create({
				data: {
					userId,
					orderId: order.id,
					type: "PURCHASE",
					amount: -total,
					balanceAfter: updatedBuyer.balance,
					description: `Order ${order.id.slice(-6).toUpperCase()}`,
				},
			});

			await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

			return order.id;
		});

		return this.getDetailForBuyer(userId, orderId);
	}

	// Buyer order history (newest first).
	async listForBuyer(userId: string) {
		const orders = await this.prisma.order.findMany({
			where: { buyerId: userId },
			orderBy: { createdAt: "desc" },
			include: orderDetailInclude,
		});
		return orders.map((o) => this.toSummary(o));
	}

	async getDetailForBuyer(userId: string, id: string) {
		const order = await this.prisma.order.findFirst({
			where: { id, buyerId: userId },
			include: orderDetailInclude,
		});
		if (!order) {
			throw new NotFoundException("Order not found");
		}
		return this.toDetail(order);
	}

	// Seller incoming orders for the seller's store (newest first).
	async listIncoming(payload: JwtPayload) {
		const store = await this.prisma.store.findUnique({
			where: { sellerId: payload.sub },
			select: { id: true },
		});
		if (!store) return [];
		const orders = await this.prisma.order.findMany({
			where: { storeId: store.id },
			orderBy: { createdAt: "desc" },
			include: orderDetailInclude,
		});
		return orders.map((o) => this.toSummary(o));
	}

	private toDetail(order: OrderWithDetail) {
		return {
			id: order.id,
			status: order.status,
			deliveryMethod: order.deliveryMethod,
			subtotal: order.subtotal,
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

	private toSummary(order: OrderWithDetail) {
		return {
			id: order.id,
			status: order.status,
			deliveryMethod: order.deliveryMethod,
			total: order.total,
			totalItems: order.items.reduce((sum, i) => sum + i.quantity, 0),
			store: order.store,
			buyerName: order.buyer.name,
			createdAt: order.createdAt,
		};
	}
}
