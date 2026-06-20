import { createZodDto } from "nestjs-zod";
import {
  registerSchema,
  loginSchema,
  setActiveRoleSchema,
} from "@seapedia/shared";

export class RegisterDto extends createZodDto(registerSchema) {}
export class LoginDto extends createZodDto(loginSchema) {}
export class SetActiveRoleDto extends createZodDto(setActiveRoleSchema) {}
