import { Injectable, NotFoundException } from "@nestjs/common";
import type { SaveAddressInput } from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AddressesService {
	constructor(private readonly prisma: PrismaService) {}

	// Default address first, then newest.
	list(userId: string) {
		return this.prisma.address.findMany({
			where: { userId },
			orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
		});
	}

	async create(userId: string, dto: SaveAddressInput) {
		// The first address a buyer adds is their default.
		const count = await this.prisma.address.count({ where: { userId } });
		const isDefault = dto.isDefault || count === 0;

		return this.prisma.$transaction(async (tx) => {
			if (isDefault) {
				await tx.address.updateMany({
					where: { userId, isDefault: true },
					data: { isDefault: false },
				});
			}
			return tx.address.create({
				data: {
					userId,
					label: dto.label,
					recipientName: dto.recipientName,
					phone: dto.phone,
					line1: dto.line1,
					city: dto.city,
					province: dto.province,
					postalCode: dto.postalCode,
					isDefault,
				},
			});
		});
	}

	async update(userId: string, id: string, dto: SaveAddressInput) {
		await this.requireOwnedAddress(userId, id);
		const isDefault = dto.isDefault ?? false;

		return this.prisma.$transaction(async (tx) => {
			if (isDefault) {
				await tx.address.updateMany({
					where: { userId, isDefault: true, NOT: { id } },
					data: { isDefault: false },
				});
			}
			return tx.address.update({
				where: { id },
				data: {
					label: dto.label,
					recipientName: dto.recipientName,
					phone: dto.phone,
					line1: dto.line1,
					city: dto.city,
					province: dto.province,
					postalCode: dto.postalCode,
					isDefault,
				},
			});
		});
	}

	async remove(userId: string, id: string) {
		const address = await this.requireOwnedAddress(userId, id);

		await this.prisma.$transaction(async (tx) => {
			await tx.address.delete({ where: { id } });
			// If we removed the default, promote the next newest address.
			if (address.isDefault) {
				const next = await tx.address.findFirst({
					where: { userId },
					orderBy: { createdAt: "desc" },
				});
				if (next) {
					await tx.address.update({
						where: { id: next.id },
						data: { isDefault: true },
					});
				}
			}
		});
		return { id };
	}

	// Resolve an address and enforce that it belongs to the current buyer.
	private async requireOwnedAddress(userId: string, id: string) {
		const address = await this.prisma.address.findUnique({ where: { id } });
		if (!address || address.userId !== userId) {
			throw new NotFoundException("Address not found");
		}
		return address;
	}
}
