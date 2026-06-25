import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DeliveryService } from "./delivery.service";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import type { JwtPayload } from "../auth/jwt.types";

@ApiTags("delivery")
@Controller("delivery")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("DRIVER")
@ApiBearerAuth("bearer")
export class DeliveryController {
	constructor(private readonly deliveryService: DeliveryService) {}

	@Get()
	@ApiOperation({ summary: "List delivery jobs available for drivers to take" })
	listAvailable() {
		return this.deliveryService.listAvailable();
	}

	@Get(":id")
	@ApiOperation({
		summary: "Get a delivery job's detail (available or assigned to the driver)",
	})
	getDetail(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
		return this.deliveryService.getDetail(user.sub, id);
	}
}
