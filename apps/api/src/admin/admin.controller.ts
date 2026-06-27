import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AdminService } from "./admin.service";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";

@ApiTags("admin")
@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN")
@ApiBearerAuth("bearer")
export class AdminController {
	constructor(private readonly admin: AdminService) {}

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
}
