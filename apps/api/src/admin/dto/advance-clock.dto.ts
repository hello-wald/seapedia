import { createZodDto } from "nestjs-zod";
import { advanceClockSchema } from "@seapedia/shared";

export class AdvanceClockDto extends createZodDto(advanceClockSchema) {}
