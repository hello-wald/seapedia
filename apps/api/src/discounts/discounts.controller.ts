import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DiscountsService } from "./discounts.service";
import { CreatePromoDto, CreateVoucherDto } from "./dto/discount.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";

@ApiTags("discounts")
@Controller("discounts")
export class DiscountsController {
	constructor(private readonly discounts: DiscountsService) {}

	@Post("vouchers")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Admin: generate a voucher" })
	createVoucher(@Body() dto: CreateVoucherDto) {
		return this.discounts.createVoucher(dto);
	}

	@Post("promos")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Admin: generate a promo" })
	createPromo(@Body() dto: CreatePromoDto) {
		return this.discounts.createPromo(dto);
	}

	@Get("vouchers")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Admin: list all vouchers" })
	listVouchers() {
		return this.discounts.listVouchers();
	}

	@Get("promos")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Admin: list all promos" })
	listPromos() {
		return this.discounts.listPromos();
	}

	@Get("available")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("BUYER")
	@ApiBearerAuth("bearer")
	@ApiOperation({
		summary: "List discount codes the buyer can use right now",
	})
	listAvailable() {
		return this.discounts.listAvailable();
	}

	@Get("vouchers/:id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Admin: get a voucher by id" })
	getVoucher(@Param("id") id: string) {
		return this.discounts.getVoucher(id);
	}

	@Get("promos/:id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("ADMIN")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Admin: get a promo by id" })
	getPromo(@Param("id") id: string) {
		return this.discounts.getPromo(id);
	}
}
