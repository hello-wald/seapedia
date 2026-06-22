import { createZodDto } from "nestjs-zod";
import { topUpSchema } from "@seapedia/shared";

export class TopUpDto extends createZodDto(topUpSchema) {}
