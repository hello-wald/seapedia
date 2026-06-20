import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { Role } from "@seapedia/shared";
import { ROLES_KEY } from "../decorator/roles.decorator";
import type { JwtPayload } from "../jwt.types";

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const required = this.reflector.getAllAndOverride<Role[] | undefined>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!required || required.length === 0) {
			return true;
		}

		const request = context
			.switchToHttp()
			.getRequest<Request & { user?: JwtPayload }>();
		const user = request.user;

		if (!user?.activeRole) {
			throw new ForbiddenException("No active role selected");
		}

		if (!required.includes(user.activeRole)) {
			throw new ForbiddenException(
				`Active role ${user.activeRole} is not permitted here`,
			);
		}

		return true;
	}
}
