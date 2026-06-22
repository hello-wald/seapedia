import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { WalletService } from "./wallet.service";
import { TopUpDto } from "./dto/wallet.dto";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { CurrentUser } from "../auth/decorator/current-user.decorator";
import type { JwtPayload } from "../auth/jwt.types";

@ApiTags("wallet")
@Controller("wallet")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("BUYER")
@ApiBearerAuth("bearer")
export class WalletController {
	constructor(private readonly walletService: WalletService) {}

	@Get()
	@ApiOperation({ summary: "Get the buyer's wallet balance and history" })
	getWallet(@CurrentUser() user: JwtPayload) {
		return this.walletService.getSummary(user.sub);
	}

	@Post("topup")
	@ApiOperation({ summary: "Dummy top-up of the buyer's wallet balance" })
	topUp(@CurrentUser() user: JwtPayload, @Body() dto: TopUpDto) {
		return this.walletService.topUp(user.sub, dto.amount);
	}
}
