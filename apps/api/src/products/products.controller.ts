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
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	// Public: catalog listing for guests and buyers.
	@Get()
	@ApiOperation({ summary: "List all products for the public catalog" })
	listPublic() {
		return this.productsService.listPublic();
	}

	@Get("me")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "List products owned by the current seller" })
	listMine(@CurrentUser() user: JwtPayload) {
		return this.productsService.listMine(user);
	}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Create a product in the current seller's store" })
	create(@CurrentUser() user: JwtPayload, @Body() dto: SaveProductDto) {
		return this.productsService.create(user, dto);
	}

	@Put(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Update one of the current seller's products" })
	update(
		@CurrentUser() user: JwtPayload,
		@Param("id") id: string,
		@Body() dto: SaveProductDto,
	) {
		return this.productsService.update(user, id, dto);
	}

	@Delete(":id")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Delete one of the current seller's products" })
	remove(@CurrentUser() user: JwtPayload, @Param("id") id: string) {
		return this.productsService.remove(user, id);
	}

	// Public: product detail for guests and buyers.
	@Get(":id")
	@ApiOperation({ summary: "Get a public product detail by id" })
	getPublicDetail(@Param("id") id: string) {
		return this.productsService.getPublicDetail(id);
	}
}
