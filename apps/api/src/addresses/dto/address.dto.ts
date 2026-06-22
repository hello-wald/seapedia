import { createZodDto } from "nestjs-zod";
import { saveAddressSchema } from "@seapedia/shared";

export class SaveAddressDto extends createZodDto(saveAddressSchema) {}
