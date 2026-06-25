import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { DeliveryService } from "./delivery.service";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";

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
}
