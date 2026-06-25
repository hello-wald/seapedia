import {
	Body,
	Controller,
	Get,
	HttpCode,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto, SetActiveRoleDto } from "./dto/auth.dto";
import { JwtAuthGuard } from "./guard/jwt-auth.guard";
import { CurrentUser } from "./decorator/current-user.decorator";
import type { JwtPayload } from "./jwt.types";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@Post("register")
	@ApiOperation({ summary: "Register a new account" })
	register(@Body() dto: RegisterDto) {
		return this.authService.register(dto);
	}

	@Post("login")
	@HttpCode(200)
	@ApiOperation({ summary: "Log in and receive an access token" })
	login(@Body() dto: LoginDto) {
		return this.authService.login(dto);
	}

	@Get("me")
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Get the current authenticated user" })
	me(@CurrentUser() user: JwtPayload) {
		return this.authService.me(user);
	}

	@Post("active-role")
	@HttpCode(200)
	@UseGuards(JwtAuthGuard)
	@ApiBearerAuth("bearer")
	@ApiOperation({ summary: "Select or switch the active role" })
	setActiveRole(
		@CurrentUser() user: JwtPayload,
		@Body() dto: SetActiveRoleDto,
	) {
		return this.authService.setActiveRole(user, dto.role);
	}
}
