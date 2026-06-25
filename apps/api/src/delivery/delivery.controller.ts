import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
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
	@ApiOperation({
		summary: "List delivery jobs available for drivers to take",
	})
	listAvailable() {
		return this.deliveryService.listAvailable();
	}

	@Get("mine")
	@ApiOperation({ summary: "List the driver's in-progress (taken) jobs" })
	listMine(@CurrentUser() user: JwtPayload) {
		return this.deliveryService.listMine(user.sub);
	}

	@Get("report")
	@ApiOperation({ summary: "Driver earnings summary" })
	report(@CurrentUser() user: JwtPayload) {
		return this.deliveryService.report(user.sub);
	}

	@Get("history")
	@ApiOperation({ summary: "List the driver's completed (delivered) jobs" })
	listHistory(@CurrentUser() user: JwtPayload) {
		return this.deliveryService.listCompleted(user.sub);
	}

	@Get(":id")
	@ApiOperation({
		summary:
			"Get a delivery job's detail (available or assigned to the driver)",
	})
	getDetail(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
		return this.deliveryService.getDetail(user.sub, id);
	}

	@Post(":id/take")
	@ApiOperation({
		summary: "Take an available delivery job",
	})
	take(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
		return this.deliveryService.takeJob(user.sub, id);
	}

	@Post(":id/complete")
	@ApiOperation({
		summary: "Confirm a taken job as delivered (order → Selesai)",
	})
	complete(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
		return this.deliveryService.completeJob(user.sub, id);
	}
}
