import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { OverdueService } from "./overdue.service";
import { AdvanceClockDto } from "./dto/advance-clock.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@ApiBearerAuth("bearer")
export class AdminController {
	constructor(
		private readonly admin: AdminService,
		private readonly overdueService: OverdueService,
	) {}

	@Get("overview")
	@ApiOperation({ summary: "Admin: marketplace monitoring summary counts" })
	overview() {
		return this.admin.overview();
	}

	@Get("users")
	@ApiOperation({ summary: "Admin: list users" })
	users() {
		return this.admin.users();
	}

	@Get("stores")
	@ApiOperation({ summary: "Admin: list stores" })
	stores() {
		return this.admin.stores();
	}

	@Get("products")
	@ApiOperation({ summary: "Admin: list products" })
	products() {
		return this.admin.products();
	}

	@Get("orders")
	@ApiOperation({ summary: "Admin: list orders" })
	orders() {
		return this.admin.orders();
	}

	@Get("deliveries")
	@ApiOperation({ summary: "Admin: list delivery jobs" })
	deliveries() {
		return this.admin.deliveries();
	}

	@Get("clock")
	@ApiOperation({ summary: "Admin: current simulated clock" })
	clock() {
		return this.overdueService.clockState();
	}

	@Post("clock/advance")
	@ApiOperation({ summary: "Admin: advance the simulated clock by N days" })
	advanceClock(@Body() dto: AdvanceClockDto) {
		return this.overdueService.advanceClock(dto.days);
	}

	@Post("clock/reset")
	@ApiOperation({ summary: "Admin: reset the simulated clock" })
	resetClock() {
		return this.overdueService.resetClock();
	}

	@Get("overdue")
	@ApiOperation({
		summary: "Admin: overdue + returned orders as of the clock",
	})
	listOverdue() {
		return this.overdueService.listOverdue();
	}

	@Post("overdue/run")
	@ApiOperation({ summary: "Admin: auto-return & refund all overdue orders" })
	runOverdue() {
		return this.overdueService.run();
	}
}
