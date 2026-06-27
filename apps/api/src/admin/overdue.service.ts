import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { orderDeadline } from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";
import { WalletService } from "../wallet/wallet.service";

const NON_TERMINAL = [
	"SEDANG_DIKEMAS",
	"MENUNGGU_PENGIRIM",
	"DIKIRIM",
] as const;

const orderSummaryInclude = {
	store: { select: { id: true, name: true, description: true } },
	buyer: { select: { name: true } },
	items: { select: { quantity: true } },
} satisfies Prisma.OrderInclude;

type OrderForSummary = Prisma.OrderGetPayload<{
	include: typeof orderSummaryInclude;
}>;

@Injectable()
export class OverdueService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly wallet: WalletService,
	) {}

	private effectiveNow(offsetDays: number) {
		return new Date(Date.now() + offsetDays * 86_400_000);
	}

	async clockState() {
		const row = await this.prisma.systemClock.upsert({
			where: { id: "singleton" },
			update: {},
			create: { id: "singleton" },
		});
		return {
			offsetDays: row.offsetDays,
			now: this.effectiveNow(row.offsetDays),
		};
	}

	async advanceClock(days: number) {
		await this.prisma.systemClock.upsert({
			where: { id: "singleton" },
			update: { offsetDays: { increment: days } },
			create: { id: "singleton", offsetDays: days },
		});
		return this.clockState();
	}

	async resetClock() {
		await this.prisma.systemClock.upsert({
			where: { id: "singleton" },
			update: { offsetDays: 0 },
			create: { id: "singleton", offsetDays: 0 },
		});
		return this.clockState();
	}

	async listOverdue() {
		const clock = await this.clockState();
		const [active, returned] = await Promise.all([
			this.prisma.order.findMany({
				where: { status: { in: [...NON_TERMINAL] } },
				orderBy: { createdAt: "asc" },
				include: orderSummaryInclude,
			}),
			this.prisma.order.findMany({
				where: { status: "DIKEMBALIKAN" },
				orderBy: { updatedAt: "desc" },
				take: 100,
				include: orderSummaryInclude,
			}),
		]);

		const overdue = active.filter(
			(o) => clock.now > orderDeadline(o.createdAt, o.deliveryMethod),
		);

		return {
			clock,
			overdue: overdue.map((o) => this.toSummary(o)),
			returned: returned.map((o) => this.toSummary(o)),
		};
	}

	// Auto-return + refund every overdue order.
	async run() {
		const { now } = await this.clockState();
		const candidates = await this.prisma.order.findMany({
			where: { status: { in: [...NON_TERMINAL] } },
			include: { items: { select: { productId: true, quantity: true } } },
		});
		const overdue = candidates.filter(
			(o) => now > orderDeadline(o.createdAt, o.deliveryMethod),
		);

		const orderIds: string[] = [];
		let refundedTotal = 0;

		for (const order of overdue) {
			const refunded = await this.prisma.$transaction(async (tx) => {
				// Atomic claim: only one run can flip a still-open order.
				const claim = await tx.order.updateMany({
					where: { id: order.id, status: { in: [...NON_TERMINAL] } },
					data: { status: "DIKEMBALIKAN" },
				});
				if (claim.count === 0) return 0; // already handled

				// Restore stock for each line item.
				for (const item of order.items) {
					if (item.productId) {
						await tx.product.update({
							where: { id: item.productId },
							data: { stock: { increment: item.quantity } },
						});
					}
				}

				// Full refund back to the buyer's wallet.
				await this.wallet.refund(tx, order.buyerId, order.total, {
					orderId: order.id,
					description: `Refund for overdue order ${order.id
						.slice(-6)
						.toUpperCase()}`,
				});

				// Timestamped status-history trace.
				await tx.orderStatusHistory.create({
					data: { orderId: order.id, status: "DIKEMBALIKAN" },
				});

				return order.total;
			});

			if (refunded > 0) {
				orderIds.push(order.id);
				refundedTotal += refunded;
			}
		}

		return { processed: orderIds.length, refundedTotal, orderIds };
	}

	private toSummary(order: OrderForSummary) {
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
