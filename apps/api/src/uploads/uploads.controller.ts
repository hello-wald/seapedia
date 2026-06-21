import {
	BadRequestException,
	Controller,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiOperation,
	ApiTags,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guard/jwt-auth.guard";
import { RolesGuard } from "../auth/guard/roles.guard";
import { Roles } from "../auth/decorator/roles.decorator";
import { CloudinaryService } from "./cloudinary.service";

const MAX_FILE_SIZE = 2_000_000; // 2 MB

@ApiTags("uploads")
@Controller("uploads")
export class UploadsController {
	constructor(private readonly cloudinary: CloudinaryService) {}

	@Post("image")
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles("SELLER")
	@ApiBearerAuth("bearer")
	@ApiConsumes("multipart/form-data")
	@ApiBody({
		schema: {
			type: "object",
			properties: { image: { type: "string", format: "binary" } },
		},
	})
	@ApiOperation({ summary: "Upload a product image to Cloudinary (seller only)" })
	@UseInterceptors(
		FileInterceptor("image", {
			storage: memoryStorage(),
			limits: { fileSize: MAX_FILE_SIZE },
			fileFilter: (
				_req: Request,
				file: Express.Multer.File,
				cb: (error: Error | null, accept: boolean) => void,
			) => {
				if (!file.mimetype.startsWith("image/")) {
					return cb(
						new BadRequestException("Only image files are allowed"),
						false,
					);
				}
				cb(null, true);
			},
		}),
	)
	async uploadImage(@UploadedFile() file?: Express.Multer.File) {
		if (!file) {
			throw new BadRequestException("No image file provided");
		}
		const url = await this.cloudinary.uploadImage(file.buffer);
		return { url };
	}
}
