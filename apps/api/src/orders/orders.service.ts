import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import {
	type BalanceSummary,
	type BuyerSpendingReport,
	type CheckoutInput,
	type Role,
	type SellerIncomeReport,
	computeDiscount,
	computeOrderTotals,
} from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";
import { DiscountsService } from "../discounts/discounts.service";
import type { JwtPayload } from "../auth/jwt.types";

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
	constructor(
		private readonly prisma: PrismaService,
		private readonly wallet: WalletService,
		private readonly discounts: DiscountsService,
	) {}

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

			// Re-validate discount code & consume
			const resolution = await this.discounts.consume(
				tx,
				dto.discountCode,
			);
			const discount = resolution
				? computeDiscount(subtotal, resolution.percent)
				: 0;

			const { deliveryFee, tax, total } = computeOrderTotals(
				subtotal,
				dto.deliveryMethod,
				discount,
			);

			for (const item of cart.items) {
				const res = await tx.product.updateMany({
					where: {
						id: item.productId,
						stock: { gte: item.quantity }, // Check stock
					},
					data: { stock: { decrement: item.quantity } },
				});
				if (res.count === 0) {
					throw new BadRequestException(
						`Not enough stock for "${item.product.name}"`,
					);
				}
			}

			const order = await tx.order.create({
				data: {
					buyerId: userId,
					storeId,
					deliveryMethod: dto.deliveryMethod,
					subtotal,
					discount,
					discountCode: resolution?.code ?? null,
					discountKind: resolution?.kind ?? null,
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

			// Charge the wallet and record purchase.
			await this.wallet.debit(tx, userId, total, {
				description: `Order ${order.id.slice(-6).toUpperCase()}`,
				orderId: order.id,
			});

			await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

			return order.id;
		});

		return this.getDetail(userId, orderId);
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

	async getDetail(userId: string, id: string) {
		const order = await this.prisma.order.findFirst({
			where: {
				id,
				OR: [{ buyerId: userId }, { store: { sellerId: userId } }], // Buyer who bought or Seller of store
			},
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

	// Seller processes an incoming order.
	async processOrder(payload: JwtPayload, id: string) {
		const store = await this.prisma.store.findUnique({
			where: { sellerId: payload.sub },
			select: { id: true },
		});
		if (!store) {
			throw new ForbiddenException("Create your store first");
		}

		const order = await this.prisma.order.findUnique({
			where: { id },
			select: { id: true, storeId: true, status: true },
		});
		if (!order) {
			throw new NotFoundException("Order not found");
		}
		if (order.storeId !== store.id) {
			throw new ForbiddenException(
				"You can only process your own store's orders",
			);
		}
		if (order.status !== "SEDANG_DIKEMAS") {
			throw new BadRequestException("Order has already been processed");
		}

		const updated = await this.prisma.$transaction(async (tx) => {
			await tx.order.update({
				where: { id },
				data: { status: "MENUNGGU_PENGIRIM" },
			});
			await tx.orderStatusHistory.create({
				data: { orderId: id, status: "MENUNGGU_PENGIRIM" },
			});
			await tx.delivery.create({ data: { orderId: id } });
			return tx.order.findUniqueOrThrow({
				where: { id },
				include: orderDetailInclude,
			});
		});

		return this.toSummary(updated);
	}

	// Buyer spending report.
	async buyerReport(userId: string): Promise<BuyerSpendingReport> {
		const orders = await this.prisma.order.findMany({
			where: { buyerId: userId, status: { not: "DIBATALKAN" } },
			select: {
				total: true,
				discount: true,
				items: { select: { quantity: true } },
			},
		});
		return orders.reduce<BuyerSpendingReport>(
			(acc, o) => ({
				totalSpent: acc.totalSpent + o.total,
				ordersPlaced: acc.ordersPlaced + 1,
				itemsBought:
					acc.itemsBought +
					o.items.reduce((s, i) => s + i.quantity, 0),
				totalSaved: acc.totalSaved + o.discount,
			}),
			{ totalSpent: 0, ordersPlaced: 0, itemsBought: 0, totalSaved: 0 },
		);
	}

	// Seller income report.
	async sellerReport(payload: JwtPayload): Promise<SellerIncomeReport> {
		const empty: SellerIncomeReport = {
			receivedIncome: 0,
			pendingIncome: 0,
			completedOrders: 0,
			itemsSold: 0,
		};
		const store = await this.prisma.store.findUnique({
			where: { sellerId: payload.sub },
			select: { id: true },
		});
		if (!store) return empty;

		const orders = await this.prisma.order.findMany({
			where: { storeId: store.id, status: { not: "DIBATALKAN" } },
			select: {
				subtotal: true,
				status: true,
				items: { select: { quantity: true } },
			},
		});
		return orders.reduce<SellerIncomeReport>((acc, o) => {
			const completed = o.status === "SELESAI";
			return {
				receivedIncome:
					acc.receivedIncome + (completed ? o.subtotal : 0),
				pendingIncome: acc.pendingIncome + (completed ? 0 : o.subtotal),
				completedOrders: acc.completedOrders + (completed ? 1 : 0),
				itemsSold:
					acc.itemsSold + o.items.reduce((s, i) => s + i.quantity, 0),
			};
		}, empty);
	}

	private async sellerReceivedIncome(sellerId: string): Promise<number> {
		const store = await this.prisma.store.findUnique({
			where: { sellerId },
			select: { id: true },
		});
		if (!store) return 0;
		const agg = await this.prisma.order.aggregate({
			where: { storeId: store.id, status: "SELESAI" },
			_sum: { subtotal: true },
		});
		return agg._sum.subtotal ?? 0;
	}

	// Cross-role balance summary
	async getBalanceSummary(payload: JwtPayload): Promise<BalanceSummary> {
		const owns = (role: Role) => payload.roles.includes(role);
		const [wallet, sellerIncome] = await Promise.all([
			owns("BUYER")
				? this.prisma.wallet.findUnique({
						where: { userId: payload.sub },
						select: { balance: true },
					})
				: null,
			owns("SELLER") ? this.sellerReceivedIncome(payload.sub) : null,
		]);
		return {
			activeRole: payload.activeRole,
			wallet: owns("BUYER") ? { balance: wallet?.balance ?? 0 } : null,
			sellerIncome: owns("SELLER") ? { total: sellerIncome ?? 0 } : null,
			driverEarnings: owns("DRIVER") ? { total: null } : null,
		};
	}

	private toDetail(order: OrderWithDetail) {
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
