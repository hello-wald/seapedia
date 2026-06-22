import { createZodDto } from "nestjs-zod";
import { addToCartSchema, updateCartItemSchema } from "@seapedia/shared";

export class AddToCartDto extends createZodDto(addToCartSchema) {}

export class UpdateCartItemDto extends createZodDto(updateCartItemSchema) {}
