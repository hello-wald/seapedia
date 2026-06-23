import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import type {
	AddToCartInput,
	CartSummary,
	UpdateCartItemInput,
} from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";

const cartInclude = {
	items: {
		orderBy: { createdAt: "asc" },
		include: {
			product: {
				include: {
					store: {
						select: { id: true, name: true, description: true },
					},
				},
			},
		},
	},
} as const;

@Injectable()
export class CartService {
	constructor(private readonly prisma: PrismaService) {}

	async getSummary(userId: string): Promise<CartSummary> {
		const cart = await this.getOrCreateCart(userId);
		return this.buildSummary(cart);
	}

	async addItem(userId: string, dto: AddToCartInput): Promise<CartSummary> {
		const product = await this.prisma.product.findUnique({
			where: { id: dto.productId },
		});
		if (!product) {
			throw new NotFoundException("Product not found");
		}
		if (product.stock <= 0) {
			throw new BadRequestException("Product is out of stock");
		}
		if (dto.quantity > product.stock) {
			throw new BadRequestException(
				`Only ${product.stock} item(s) available`,
			);
		}

		const cart = await this.getOrCreateCart(userId);

		// a cart can only hold products from one store.
		const otherStore = cart.items.find(
			(item) => item.product.storeId !== product.storeId,
		);
		if (otherStore) {
			if (!dto.replace) {
				throw new ConflictException({
					message:
						"Your cart contains items from another store. Empty it or replace to continue.",
					conflict: true,
					currentStoreName: otherStore.product.store.name,
				});
			}
			// Replace: clear the existing (other store's) items first.
			await this.prisma.cartItem.deleteMany({
				where: { cartId: cart.id },
			});
		}

		const existing = otherStore
			? undefined
			: cart.items.find((item) => item.productId === product.id);
		const nextQuantity = Math.min(
			(existing?.quantity ?? 0) + dto.quantity,
			product.stock,
		);

		await this.prisma.cartItem.upsert({
			where: {
				cartId_productId: { cartId: cart.id, productId: product.id },
			},
			create: {
				cartId: cart.id,
				productId: product.id,
				quantity: nextQuantity,
			},
			update: { quantity: nextQuantity },
		});

		return this.getSummary(userId);
	}

	async updateItem(
		userId: string,
		itemId: string,
		dto: UpdateCartItemInput,
	): Promise<CartSummary> {
		const item = await this.requireOwnedItem(userId, itemId);
		const quantity = Math.min(dto.quantity, item.product.stock);
		await this.prisma.cartItem.update({
			where: { id: item.id },
			data: { quantity },
		});
		return this.getSummary(userId);
	}

	async removeItem(userId: string, itemId: string): Promise<CartSummary> {
		const item = await this.requireOwnedItem(userId, itemId);
		await this.prisma.cartItem.delete({ where: { id: item.id } });
		return this.getSummary(userId);
	}

	async clear(userId: string): Promise<CartSummary> {
		const cart = await this.getOrCreateCart(userId);
		await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
		return this.getSummary(userId);
	}

	private getOrCreateCart(userId: string) {
		return this.prisma.cart.upsert({
			where: { userId },
			create: { userId },
			update: {},
			include: cartInclude,
		});
	}

	// Resolve a cart item and enforce that it belongs to the buyer's cart.
	private async requireOwnedItem(userId: string, itemId: string) {
		const item = await this.prisma.cartItem.findUnique({
			where: { id: itemId },
			include: { cart: true, product: true },
		});
		if (!item || item.cart.userId !== userId) {
			throw new NotFoundException("Cart item not found");
		}
		return item;
	}

	private buildSummary(
		cart: Awaited<ReturnType<CartService["getOrCreateCart"]>>,
	): CartSummary {
		const items = cart.items.map((item) => ({
			id: item.id,
			productId: item.productId,
			name: item.product.name,
			price: item.product.price,
			imageUrl: item.product.imageUrl,
			stock: item.product.stock,
			quantity: item.quantity,
			lineTotal: item.product.price * item.quantity,
		}));
		const store = cart.items[0]?.product.store ?? null;
		return {
			store,
			items,
			subtotal: items.reduce((sum, i) => sum + i.lineTotal, 0),
			totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
		};
	}
}
