import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AddressesService } from "./addresses.service";
import { SaveAddressDto } from "./dto/address.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import type { JwtPayload } from "../auth/jwt.types";

@ApiTags("addresses")
@Controller("addresses")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("BUYER")
@ApiBearerAuth("bearer")
export class AddressesController {
	constructor(private readonly addressesService: AddressesService) {}

	@Get()
	@ApiOperation({ summary: "List the current buyer's delivery addresses" })
	list(@CurrentUser() user: JwtPayload) {
		return this.addressesService.list(user.sub);
	}

	@Post()
	@ApiOperation({ summary: "Create a delivery address for the current buyer" })
	create(@CurrentUser() user: JwtPayload, @Body() dto: SaveAddressDto) {
		return this.addressesService.create(user.sub, dto);
	}

	@Put(":id")
	@ApiOperation({ summary: "Update one of the current buyer's addresses" })
	update(
		@CurrentUser() user: JwtPayload,
		@Param("id") id: string,
		@Body() dto: SaveAddressDto,
	) {
		return this.addressesService.update(user.sub, id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete one of the current buyer's addresses" })
	remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
		return this.addressesService.remove(user.sub, id);
	}
}
