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
import { ProductsService } from "./products.service";
import { SaveProductDto } from "./dto/product.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import type { JwtPayload } from "../auth/jwt.types";

@ApiTags("products")
@Controller("products")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("SELLER")
@ApiBearerAuth("bearer")
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Get("me")
	@ApiOperation({ summary: "List products owned by the current seller" })
	listMine(@CurrentUser() user: JwtPayload) {
		return this.productsService.listMine(user);
	}

	@Post()
	@ApiOperation({ summary: "Create a product in the current seller's store" })
	create(@CurrentUser() user: JwtPayload, @Body() dto: SaveProductDto) {
		return this.productsService.create(user, dto);
	}

	@Put(":id")
	@ApiOperation({ summary: "Update one of the current seller's products" })
	update(
		@CurrentUser() user: JwtPayload,
		@Param("id") id: string,
		@Body() dto: SaveProductDto,
	) {
		return this.productsService.update(user, id, dto);
	}

	@Delete(":id")
	@ApiOperation({ summary: "Delete one of the current seller's products" })
	remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
		return this.productsService.remove(user, id);
	}
}
