import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
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

		return {
			...toOrderDetail(delivery.order),
			deliveryId: delivery.id,
			driverId: delivery.driverId,
			takenAt: delivery.takenAt,
			completedAt: delivery.completedAt,
		};
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
			createdAt: delivery.createdAt,
		};
	}
}
