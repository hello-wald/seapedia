import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { PrismaService } from "./prisma/prisma.service";

@ApiTags("health")
@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get("health")
  @ApiOperation({ summary: "Liveness check (API + database)" })
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: "ok", db: "up" };
  }
}
