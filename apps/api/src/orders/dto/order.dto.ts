import { createZodDto } from "nestjs-zod";
import { checkoutSchema } from "@seapedia/shared";

export class CheckoutDto extends createZodDto(checkoutSchema) {}
