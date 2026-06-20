import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	UseGuards,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto, SetActiveRoleDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";
import { RolesGuard } from "./guard/roles.guard";
import { Roles } from "./decorator/roles.decorator";
import { CurrentUser } from "./decorator/current-user.decorator";
import type { JwtPayload } from "./jwt.types";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("register")
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post("login")
	@HttpCode(200)
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Post("logout")
	@HttpCode(200)
	logout() {
		return { success: true };
	}

	@Get("me")
	@UseGuards(JwtAuthGuard)
	me(@CurrentUser() user: JwtPayload) {
		return this.authService.me(user);
	}

	@Post("active-role")
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	setActiveRole(
		@CurrentUser() user: JwtPayload,
		@Body() dto: SetActiveRoleDto,
	) {
		return this.authService.setActiveRole(user, dto.role);
	}

	@Get("balance")
	@UseGuards(JwtAuthGuard)
	balance(@CurrentUser() user: JwtPayload) {
		return this.authService.getBalanceSummary(user);
	}

	// @Get("seller/ping")
	// @UseGuards(JwtAuthGuard, RolesGuard)
	// @Roles("SELLER")
	// sellerPing(@CurrentUser() user: JwtPayload) {
	//   return { ok: true, activeRole: user.activeRole };
	// }
}
