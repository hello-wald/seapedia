import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { CreateStoreInput, PublicStore } from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";
import type { JwtPayload } from "../auth/jwt.types";

@Injectable()
export class StoresService {
	constructor(private readonly prisma: PrismaService) {}

	// Current seller's store (may be null)
	getMyStore(payload: JwtPayload) {
		return this.prisma.store.findUnique({
			where: { sellerId: payload.sub },
		});
	}

	// Create or replace the seller's store (idempotent).
	async upsert(payload: JwtPayload, dto: CreateStoreInput) {
		const existing = await this.prisma.store.findUnique({
			where: { sellerId: payload.sub },
		});
		await this.ensureNameAvailable(dto.name, existing?.id);

		const data = { name: dto.name, description: dto.description || null };
		return existing
			? this.prisma.store.update({ where: { id: existing.id }, data })
			: this.prisma.store.create({
					data: { ...data, sellerId: payload.sub },
				});
	}

	async getPublic(id: string): Promise<PublicStore> {
		const store = await this.prisma.store.findUnique({ where: { id } });
		if (!store) {
			throw new NotFoundException("Store not found");
		}
		return {
			id: store.id,
			name: store.name,
			description: store.description,
		};
	}

	// Enforce unique store name in the backend.
	private async ensureNameAvailable(name: string, ignoreStoreId?: string) {
		const owner = await this.prisma.store.findUnique({ where: { name } });
		if (owner && owner.id !== ignoreStoreId) {
			throw new ConflictException("Store name is already used");
		}
	}
}
