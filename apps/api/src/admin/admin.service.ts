import { Injectable } from "@nestjs/common";
import type { Role } from "@prisma/client";
import type { AdminOverview } from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";

const LIST_LIMIT = 100; // for demo

@Injectable()
export class AdminService {
	constructor(private readonly prisma: PrismaService) {}

	async overview(): Promise<AdminOverview> {
		const now = new Date();
		const [
			totalUsers,
			roleGroups,
			stores,
			products,
			outOfStock,
			totalOrders,
			orderGroups,
			gmv,
			available,
			inTransit,
			delivered,
			activeVouchers,
			activePromos,
		] = await Promise.all([
			this.prisma.user.count(),
			this.prisma.userRole.groupBy({ by: ["role"], _count: true }),
			this.prisma.store.count(),
			this.prisma.product.count(),
			this.prisma.product.count({ where: { stock: { lte: 0 } } }),
			this.prisma.order.count(),
			this.prisma.order.groupBy({ by: ["status"], _count: true }),
			this.prisma.order.aggregate({
				where: { status: "SELESAI" },
				_sum: { total: true },
			}),
			this.prisma.delivery.count({
				where: {
					driverId: null,
					order: { status: "MENUNGGU_PENGIRIM" },
				},
			}),
			this.prisma.delivery.count({
				where: { order: { status: "DIKIRIM" } },
			}),
			this.prisma.delivery.count({
				where: { order: { status: "SELESAI" } },
			}),
			this.prisma.voucher.count({
				where: { isActive: true, expiresAt: { gt: now } },
			}),
			this.prisma.promo.count({
				where: { isActive: true, expiresAt: { gt: now } },
			}),
		]);

		const role = (r: Role) =>
			roleGroups.find((g) => g.role === r)?._count ?? 0;
		const status = (s: string) =>
			orderGroups.find((g) => g.status === s)?._count ?? 0;

		return {
			users: {
				total: totalUsers,
				buyers: role("BUYER"),
				sellers: role("SELLER"),
				drivers: role("DRIVER"),
			},
			stores: { total: stores },
			products: { total: products, outOfStock },
			orders: {
				total: totalOrders,
				sedangDikemas: status("SEDANG_DIKEMAS"),
				menungguPengirim: status("MENUNGGU_PENGIRIM"),
				dikirim: status("DIKIRIM"),
				selesai: status("SELESAI"),
				dikembalikan: status("DIKEMBALIKAN"),
				gmv: gmv._sum.total ?? 0,
			},
			deliveries: { available, inTransit, delivered },
			discounts: { activeVouchers, activePromos },
		};
	}

	async users() {
		const users = await this.prisma.user.findMany({
			orderBy: { createdAt: "desc" },
			take: LIST_LIMIT,
			include: { roles: true },
		});
		return users.map((u) => ({
			id: u.id,
			name: u.name,
			email: u.email,
			roles: u.roles.map((r) => r.role),
			createdAt: u.createdAt,
		}));
	}

	async stores() {
		const stores = await this.prisma.store.findMany({
			orderBy: { createdAt: "desc" },
			take: LIST_LIMIT,
			include: {
				seller: { select: { name: true } },
				_count: { select: { products: true, orders: true } },
			},
		});
		return stores.map((s) => ({
			id: s.id,
			name: s.name,
			ownerName: s.seller.name,
			productCount: s._count.products,
			orderCount: s._count.orders,
			createdAt: s.createdAt,
		}));
	}

	async products() {
		const products = await this.prisma.product.findMany({
			orderBy: { createdAt: "desc" },
			take: LIST_LIMIT,
			include: { store: { select: { name: true } } },
		});
		return products.map((p) => ({
			id: p.id,
			name: p.name,
			price: p.price,
			stock: p.stock,
			storeName: p.store.name,
		}));
	}

	async orders() {
		const orders = await this.prisma.order.findMany({
			orderBy: { createdAt: "desc" },
			take: LIST_LIMIT,
			include: {
				store: { select: { id: true, name: true, description: true } },
				buyer: { select: { name: true } },
				items: { select: { quantity: true } },
			},
		});
		return orders.map((o) => ({
			id: o.id,
			status: o.status,
			deliveryMethod: o.deliveryMethod,
			total: o.total,
			totalItems: o.items.reduce((sum, i) => sum + i.quantity, 0),
			store: o.store,
			buyerName: o.buyer.name,
			createdAt: o.createdAt,
		}));
	}

	async deliveries() {
		const deliveries = await this.prisma.delivery.findMany({
			orderBy: { createdAt: "desc" },
			take: LIST_LIMIT,
			include: {
				order: {
					select: {
						status: true,
						deliveryMethod: true,
						deliveryFee: true,
					},
				},
				driver: { select: { name: true } },
			},
		});
		return deliveries.map((d) => ({
			id: d.id,
			orderId: d.orderId,
			driverName: d.driver?.name ?? null,
			status: d.order.status,
			deliveryMethod: d.order.deliveryMethod,
			deliveryFee: d.order.deliveryFee,
			takenAt: d.takenAt,
			completedAt: d.completedAt,
		}));
	}
}
