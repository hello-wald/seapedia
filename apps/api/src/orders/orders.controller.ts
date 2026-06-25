import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { OrdersService } from "./orders.service";
import { CheckoutDto } from "./dto/order.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import type { JwtPayload } from "../auth/jwt.types";

@ApiTags("orders")
@Controller("orders")
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post("checkout")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("BUYER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Check out the buyer's cart into an order" })
	checkout(@CurrentUser() user: JwtPayload, @Body() dto: CheckoutDto) {
		return this.ordersService.checkout(user.sub, dto);
	}

	@Get()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("BUYER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "List the current buyer's order history" })
	listMine(@CurrentUser() user: JwtPayload) {
		return this.ordersService.listForBuyer(user.sub);
	}

	@Get("incoming")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "List incoming orders for the seller's store" })
	listIncoming(@CurrentUser() user: JwtPayload) {
		return this.ordersService.listIncoming(user);
	}

	@Get("report")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("BUYER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Buyer spending report (amount spent & items bought)" })
	buyerReport(@CurrentUser() user: JwtPayload) {
		return this.ordersService.buyerReport(user.sub);
	}

	@Get("incoming/report")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Seller income report (amount earned & items sold)" })
	sellerReport(@CurrentUser() user: JwtPayload) {
		return this.ordersService.sellerReport(user);
	}

	@Post(":id/process")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({
		summary: "Process an incoming order",
	})
	process(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
		return this.ordersService.processOrder(user, id);
	}

	@Get(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("BUYER", "SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({
		summary: "Get order by id (for the buyer or the store's seller)",
	})
	getOne(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
		return this.ordersService.getDetail(user.sub, id);
	}
}
