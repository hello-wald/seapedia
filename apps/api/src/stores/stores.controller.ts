import { Body, Controller, Get, Param, Put, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { StoresService } from "./stores.service";
import { SaveStoreDto } from "./dto/store.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import type { JwtPayload } from "../auth/jwt.types";

@ApiTags("stores")
@Controller("stores")
export class StoresController {
	constructor(private readonly storesService: StoresService) {}

	@Get("me")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Get the current seller's store" })
	getMyStore(@CurrentUser() user: JwtPayload) {
		return this.storesService.getMyStore(user);
	}

	// Create or replace the seller's own store (idempotent).
	@Put("me")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Create or replace the current seller's store" })
	save(@CurrentUser() user: JwtPayload, @Body() dto: SaveStoreDto) {
		return this.storesService.upsert(user, dto);
	}

	// Public store summary
	@Get(":id")
	@ApiOperation({ summary: "Get a public store summary by id" })
	getPublic(@Param("id") id: string) {
		return this.storesService.getPublic(id);
	}
}
