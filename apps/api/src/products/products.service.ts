import {
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type { CreateProductInput } from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";
import type { JwtPayload } from "../auth/jwt.types";

@Injectable()
export class ProductsService {
	constructor(private readonly prisma: PrismaService) {}

	// Public catalog: every product with its store summary.
	listPublic() {
		return this.prisma.product.findMany({
			orderBy: { createdAt: "desc" },
			include: {
				store: { select: { id: true, name: true, description: true } },
			},
		});
	}

	// Public product detail with its store summary.
	async getPublicDetail(id: string) {
		const product = await this.prisma.product.findUnique({
			where: { id },
			include: {
				store: { select: { id: true, name: true, description: true } },
			},
		});
		if (!product) {
			throw new NotFoundException("Product not found");
		}
		return product;
	}

	// List the products owned by the current seller's store
	async listMine(payload: JwtPayload) {
		const store = await this.requireStore(payload);
		return this.prisma.product.findMany({
			where: { storeId: store.id },
			orderBy: { createdAt: "desc" },
		});
	}

	async create(payload: JwtPayload, dto: CreateProductInput) {
		const store = await this.requireStore(payload);
		return this.prisma.product.create({
			data: {
				name: dto.name,
				description: dto.description || null,
				price: dto.price,
				stock: dto.stock,
				imageUrl: dto.imageUrl ?? null,
				storeId: store.id,
			},
		});
	}

	async update(payload: JwtPayload, id: string, dto: CreateProductInput) {
		await this.requireOwnedProduct(payload, id);
		return this.prisma.product.update({
			where: { id },
			data: {
				name: dto.name,
				description: dto.description || null,
				price: dto.price,
				stock: dto.stock,
				imageUrl: dto.imageUrl ?? null,
			},
		});
	}

	async remove(payload: JwtPayload, id: string) {
		await this.requireOwnedProduct(payload, id);
		await this.prisma.product.delete({ where: { id } });
		return { id };
	}

	// A seller must have a store before they can manage products
	private async requireStore(payload: JwtPayload) {
		const store = await this.prisma.store.findUnique({
			where: { sellerId: payload.sub },
		});
		if (!store) {
			throw new ForbiddenException(
				"Create your store before adding products",
			);
		}
		return store;
	}

	// Resolve a product and enforce that it belongs to the seller's store
	private async requireOwnedProduct(payload: JwtPayload, id: string) {
		const store = await this.requireStore(payload);
		const product = await this.prisma.product.findUnique({ where: { id } });
		if (!product) {
			throw new NotFoundException("Product not found");
		}
		if (product.storeId !== store.id) {
			throw new ForbiddenException(
				"You can only manage your own products",
			);
		}
		return product;
	}
}
