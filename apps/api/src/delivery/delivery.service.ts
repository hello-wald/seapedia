import {
	BadRequestException,
	ConflictException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type { DriverEarningsReport } from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";
import {
	orderDetailInclude,
	toOrderDetail,
} from "../orders/order-detail.mapper";

const deliveryListInclude = {
	order: {
		include: {
			store: { select: { id: true, name: true, description: true } },
			items: { select: { quantity: true } },
		},
	},
} satisfies Prisma.DeliveryInclude;

type DeliveryWithOrder = Prisma.DeliveryGetPayload<{
	include: typeof deliveryListInclude;
}>;

const deliveryDetailInclude = {
	order: { include: orderDetailInclude },
} satisfies Prisma.DeliveryInclude;

@Injectable()
export class DeliveryService {
	constructor(private readonly prisma: PrismaService) {}

	// Jobs ready to be picked up
	async listAvailable() {
		const deliveries = await this.prisma.delivery.findMany({
			where: {
				driverId: null,
				order: { status: "MENUNGGU_PENGIRIM" },
			},
			orderBy: { createdAt: "asc" },
			include: deliveryListInclude,
		});
		return deliveries.map((d) => this.toSummary(d));
	}

	// Job's detail
	async getDetail(driverId: string, id: string) {
		const delivery = await this.prisma.delivery.findUnique({
			where: { id },
			include: deliveryDetailInclude,
		});
		if (!delivery) {
			throw new NotFoundException("Delivery job not found");
		}

		const available =
			delivery.driverId === null &&
			delivery.order.status === "MENUNGGU_PENGIRIM";
		const mine = delivery.driverId === driverId;
		if (!available && !mine) {
			throw new ForbiddenException(
				"This job is assigned to another driver",
			);
		}

		return this.toDetail(delivery);
	}

	// The driver's in-progress jobs.
	async listMine(driverId: string) {
		const deliveries = await this.prisma.delivery.findMany({
			where: { driverId, order: { status: "DIKIRIM" } },
			orderBy: { takenAt: "desc" },
			include: deliveryListInclude,
		});
		return deliveries.map((d) => this.toSummary(d));
	}

	// Claim an available job.
	async takeJob(driverId: string, id: string) {
		return this.prisma.$transaction(async (tx) => {
			const delivery = await tx.delivery.findUnique({
				where: { id },
				select: {
					id: true,
					orderId: true,
					order: { select: { status: true } },
				},
			});
			if (!delivery) {
				throw new NotFoundException("Delivery job not found");
			}
			if (delivery.order.status !== "MENUNGGU_PENGIRIM") {
				throw new BadRequestException(
					"This job is no longer available",
				);
			}

			// Race-safe claim
			const claim = await tx.delivery.updateMany({
				where: { id, driverId: null },
				data: { driverId, takenAt: new Date() },
			});
			if (claim.count === 0) {
				throw new ConflictException(
					"This job was just taken by another driver",
				);
			}

			await tx.order.update({
				where: { id: delivery.orderId },
				data: { status: "DIKIRIM" },
			});
			await tx.orderStatusHistory.create({
				data: { orderId: delivery.orderId, status: "DIKIRIM" },
			});

			const updated = await tx.delivery.findUniqueOrThrow({
				where: { id },
				include: deliveryDetailInclude,
			});
			return this.toDetail(updated);
		});
	}

	// Mark the driver's own ongoing job as delivered.
	async completeJob(driverId: string, id: string) {
		return this.prisma.$transaction(async (tx) => {
			const delivery = await tx.delivery.findUnique({
				where: { id },
				select: {
					id: true,
					orderId: true,
					driverId: true,
					order: { select: { status: true } },
				},
			});
			if (!delivery) {
				throw new NotFoundException("Delivery job not found");
			}
			if (delivery.driverId !== driverId) {
				throw new ForbiddenException(
					"This job belongs to another driver",
				);
			}
			if (delivery.order.status !== "DIKIRIM") {
				throw new BadRequestException(
					"This job can't be completed yet",
				);
			}

			await tx.delivery.update({
				where: { id },
				data: { completedAt: new Date() },
			});
			await tx.order.update({
				where: { id: delivery.orderId },
				data: { status: "SELESAI" },
			});
			await tx.orderStatusHistory.create({
				data: { orderId: delivery.orderId, status: "SELESAI" },
			});

			const updated = await tx.delivery.findUniqueOrThrow({
				where: { id },
				include: deliveryDetailInclude,
			});
			return this.toDetail(updated);
		});
	}

	private toDetail(
		delivery: Prisma.DeliveryGetPayload<{
			include: typeof deliveryDetailInclude;
		}>,
	) {
		return {
			...toOrderDetail(delivery.order),
			deliveryId: delivery.id,
			driverId: delivery.driverId,
			takenAt: delivery.takenAt,
			completedAt: delivery.completedAt,
		};
	}

	// The driver's completed jobs, newest first.
	async listCompleted(driverId: string) {
		const deliveries = await this.prisma.delivery.findMany({
			where: { driverId, order: { status: "SELESAI" } },
			orderBy: { completedAt: "desc" },
			include: deliveryListInclude,
		});
		return deliveries.map((d) => this.toSummary(d));
	}

	// Earnings summary: a driver earns completed job's delivery fee.
	async report(driverId: string): Promise<DriverEarningsReport> {
		const completed = await this.prisma.delivery.findMany({
			where: { driverId, order: { status: "SELESAI" } },
			select: {
				order: {
					select: {
						deliveryFee: true,
						items: { select: { quantity: true } },
					},
				},
			},
		});
		const activeJobs = await this.prisma.delivery.count({
			where: { driverId, order: { status: "DIKIRIM" } },
		});

		return completed.reduce<DriverEarningsReport>(
			(acc, d) => ({
				totalEarnings: acc.totalEarnings + d.order.deliveryFee,
				completedJobs: acc.completedJobs + 1,
				activeJobs: acc.activeJobs,
				itemsDelivered:
					acc.itemsDelivered +
					d.order.items.reduce((s, i) => s + i.quantity, 0),
			}),
			{
				totalEarnings: 0,
				completedJobs: 0,
				activeJobs,
				itemsDelivered: 0,
			},
		);
	}

	private toSummary(delivery: DeliveryWithOrder) {
		const { order } = delivery;
		return {
			id: delivery.id,
			orderId: order.id,
			store: order.store,
			deliveryMethod: order.deliveryMethod,
			deliveryFee: order.deliveryFee,
			recipientName: order.recipientName,
			city: order.city,
			province: order.province,
			totalItems: order.items.reduce((sum, i) => sum + i.quantity, 0),
			status: order.status,
			completedAt: delivery.completedAt,
			createdAt: delivery.createdAt,
		};
	}
}
