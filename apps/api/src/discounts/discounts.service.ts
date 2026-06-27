import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
	AvailableDiscount,
	CreatePromoInput,
	CreateVoucherInput,
	DiscountResolution,
} from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DiscountsService {
	constructor(private readonly prisma: PrismaService) {}

	async createVoucher(dto: CreateVoucherInput) {
		try {
			return await this.prisma.voucher.create({
				data: {
					code: dto.code,
					percent: dto.percent,
					expiresAt: dto.expiresAt,
					usageLimit: dto.usageLimit,
				},
			});
		} catch (err) {
			throw this.codeConflict(err, dto.code);
		}
	}

	async createPromo(dto: CreatePromoInput) {
		try {
			return await this.prisma.promo.create({
				data: {
					code: dto.code,
					percent: dto.percent,
					expiresAt: dto.expiresAt,
				},
			});
		} catch (err) {
			throw this.codeConflict(err, dto.code);
		}
	}

	// Code already exist
	private codeConflict(err: unknown, code: string) {
		if (
			err instanceof Prisma.PrismaClientKnownRequestError &&
			err.code === "P2002"
		) {
			return new ConflictException(`Code "${code}" already exists`);
		}
		return err;
	}

	listVouchers() {
		return this.prisma.voucher.findMany({ orderBy: { createdAt: "desc" } });
	}

	async getVoucher(id: string) {
		const voucher = await this.prisma.voucher.findUnique({ where: { id } });
		if (!voucher) throw new NotFoundException("Voucher not found");
		return voucher;
	}

	listPromos() {
		return this.prisma.promo.findMany({ orderBy: { createdAt: "desc" } });
	}

	async getPromo(id: string) {
		const promo = await this.prisma.promo.findUnique({ where: { id } });
		if (!promo) throw new NotFoundException("Promo not found");
		return promo;
	}

	async listAvailable(): Promise<AvailableDiscount[]> {
		const now = new Date();
		const [vouchers, promos] = await Promise.all([
			this.prisma.voucher.findMany({
				where: { isActive: true, expiresAt: { gt: now } },
				orderBy: { percent: "desc" },
			}),
			this.prisma.promo.findMany({
				where: { isActive: true, expiresAt: { gt: now } },
				orderBy: { percent: "desc" },
			}),
		]);

		const available: AvailableDiscount[] = [];
		for (const v of vouchers) {
			const remaining = v.usageLimit - v.usedCount;
			if (remaining <= 0) continue;
			available.push({
				kind: "VOUCHER",
				code: v.code,
				percent: v.percent,
				expiresAt: v.expiresAt.toISOString(),
				remaining,
			});
		}
		for (const p of promos) {
			available.push({
				kind: "PROMO",
				code: p.code,
				percent: p.percent,
				expiresAt: p.expiresAt.toISOString(),
				remaining: null,
			});
		}
		return available;
	}

	async consume(
		tx: Prisma.TransactionClient,
		code: string | undefined,
	): Promise<DiscountResolution | null> {
		if (!code) return null;
		const now = new Date();

		const voucher = await tx.voucher.findUnique({ where: { code } });
		if (voucher) {
			if (!voucher.isActive) {
				throw new BadRequestException("This voucher is not active");
			}
			if (voucher.expiresAt <= now) {
				throw new BadRequestException("This voucher has expired");
			}
			if (voucher.usedCount >= voucher.usageLimit) {
				throw new BadRequestException(
					"This voucher has no remaining usage",
				);
			}

			const res = await tx.voucher.updateMany({
				where: {
					code,
					isActive: true,
					expiresAt: { gt: now },
					usedCount: { lt: voucher.usageLimit },
				},
				data: { usedCount: { increment: 1 } },
			});
			if (res.count === 0) {
				throw new BadRequestException(
					"This voucher has no remaining usage",
				);
			}
			return {
				kind: "VOUCHER",
				code: voucher.code,
				percent: voucher.percent,
			};
		}

		const promo = await tx.promo.findUnique({ where: { code } });
		if (promo) {
			if (!promo.isActive) {
				throw new BadRequestException("This promo is not active");
			}
			if (promo.expiresAt <= now) {
				throw new BadRequestException("This promo has expired");
			}
			return { kind: "PROMO", code: promo.code, percent: promo.percent };
		}

		throw new BadRequestException("Invalid discount code");
	}
}
