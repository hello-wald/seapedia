import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

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

@Injectable()
export class DeliveryService {
	constructor(private readonly prisma: PrismaService) {}

	// Jobs ready to be picked up: unclaimed and the order is awaiting a driver.
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
