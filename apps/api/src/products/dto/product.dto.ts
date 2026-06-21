import { createZodDto } from "nestjs-zod";
import { createProductSchema } from "@seapedia/shared";

export class SaveProductDto extends createZodDto(createProductSchema) {}
