import { createZodDto } from "nestjs-zod";
import { createPromoSchema, createVoucherSchema } from "@seapedia/shared";

export class CreateVoucherDto extends createZodDto(createVoucherSchema) {}
export class CreatePromoDto extends createZodDto(createPromoSchema) {}
