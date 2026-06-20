import {
	ConflictException,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import type { User, UserRole } from "@prisma/client";
import type {
	AuthResponse,
	LoginInput,
	RegisterInput,
	Role,
	User as PublicUser,
} from "@seapedia/shared";
import { PrismaService } from "../prisma/prisma.service";
import type { JwtPayload } from "./jwt.types";

type UserWithRoles = User & { roles: UserRole[] };

@Injectable()
export class AuthService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
	) {}

	async register(dto: RegisterInput): Promise<AuthResponse> {
		const existing = await this.prisma.user.findUnique({
			where: { email: dto.email },
		});
		if (existing) {
			throw new ConflictException("Email is already registered");
		}

		const pwHash = await bcrypt.hash(dto.password, 10);
		const user = await this.prisma.user.create({
			data: {
				name: dto.name,
				email: dto.email,
				password: pwHash,
				roles: { create: dto.roles.map((role) => ({ role })) },
			},
			include: { roles: true },
		});

		return this.buildAuthResponse(user, this.defaultActiveRole(user));
	}

	async login(dto: LoginInput): Promise<AuthResponse> {
		const user = await this.prisma.user.findUnique({
			where: { email: dto.email },
			include: { roles: true },
		});
		if (!user) {
			throw new UnauthorizedException("Invalid email");
		}

		const valid = await bcrypt.compare(dto.password, user.password);
		if (!valid) {
			throw new UnauthorizedException("Invalid password");
		}

		return this.buildAuthResponse(user, this.defaultActiveRole(user));
	}

	// Choose/switch the active role
	async setActiveRole(
		payload: JwtPayload,
		role: Role,
	): Promise<AuthResponse> {
		if (!payload.roles.includes(role)) {
			throw new ForbiddenException("You do not own that role");
		}

		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
			include: { roles: true },
		});
		if (!user) {
			throw new UnauthorizedException("User no longer exists");
		}

		return this.buildAuthResponse(user, role);
	}

	// Get current user
	async me(payload: JwtPayload): Promise<PublicUser> {
		const user = await this.prisma.user.findUnique({
			where: { id: payload.sub },
			include: { roles: true },
		});
		if (!user) {
			throw new UnauthorizedException("User no longer exists");
		}

		return this.toPublicUser(user, payload.activeRole);
	}

	// Get balance summary
	getBalanceSummary(payload: JwtPayload) {
		const owns = (role: Role) => payload.roles.includes(role);
		return {
			activeRole: payload.activeRole,
			wallet: owns("BUYER") ? { balance: null } : null,
			sellerIncome: owns("SELLER") ? { total: null } : null,
			driverEarnings: owns("DRIVER") ? { total: null } : null,
		};
	}

	// Select default role, null if multiple
	private defaultActiveRole(user: UserWithRoles): Role | null {
		const roles = user.roles.map((r) => r.role as Role);
		if (roles.includes("ADMIN")) return "ADMIN";
		if (roles.length === 1) return roles[0];
		return null;
	}

	// Build userSchema (strip password & selects role)
	private toPublicUser(
		user: UserWithRoles,
		activeRole: Role | null,
	): PublicUser {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			roles: user.roles.map((r) => r.role as Role),
			activeRole,
			createdAt: user.createdAt.toISOString(),
		};
	}

	// Build response
	private async buildAuthResponse(
		user: UserWithRoles,
		activeRole: Role | null,
	): Promise<AuthResponse> {
		const publicUser = this.toPublicUser(user, activeRole);
		const payload: JwtPayload = {
			sub: user.id,
			email: user.email,
			roles: publicUser.roles,
			activeRole,
		};
		const accessToken = await this.jwt.signAsync(payload);
		return { user: publicUser, accessToken };
	}
}
