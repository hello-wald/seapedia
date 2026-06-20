import { createZodDto } from "nestjs-zod";
import { createStoreSchema } from "@seapedia/shared";

export class SaveStoreDto extends createZodDto(createStoreSchema) {}
