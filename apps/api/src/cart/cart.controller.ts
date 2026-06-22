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
import { CartService } from "./cart.service";
import { AddToCartDto, UpdateCartItemDto } from "./dto/cart.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import type { JwtPayload } from "../auth/jwt.types";

@ApiTags("cart")
@Controller("cart")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("BUYER")
@ApiBearerAuth("bearer")
export class CartController {
	constructor(private readonly cartService: CartService) {}

	@Get()
	@ApiOperation({ summary: "Get the buyer's cart summary" })
	getCart(@CurrentUser() user: JwtPayload) {
		return this.cartService.getSummary(user.sub);
	}

	@Post("items")
	@ApiOperation({
		summary: "Add a product to the cart (single-store; 409 on store conflict)",
	})
	addItem(@CurrentUser() user: JwtPayload, @Body() dto: AddToCartDto) {
		return this.cartService.addItem(user.sub, dto);
	}

	@Put("items/:itemId")
	@ApiOperation({ summary: "Update a cart item's quantity" })
	updateItem(
		@CurrentUser() user: JwtPayload,
		@Param("itemId") itemId: string,
		@Body() dto: UpdateCartItemDto,
	) {
		return this.cartService.updateItem(user.sub, itemId, dto);
	}

	@Delete("items/:itemId")
	@ApiOperation({ summary: "Remove an item from the cart" })
	removeItem(@CurrentUser() user: JwtPayload, @Param("itemId") itemId: string) {
		return this.cartService.removeItem(user.sub, itemId);
	}

	@Delete()
	@ApiOperation({ summary: "Empty the cart" })
	clear(@CurrentUser() user: JwtPayload) {
		return this.cartService.clear(user.sub);
	}
}
