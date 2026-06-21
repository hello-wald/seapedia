import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class CloudinaryService {
	private readonly logger = new Logger(CloudinaryService.name);

	constructor() {
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
			secure: true,
		});
	}

	// Upload an in-memory image buffer to Cloudinary and return secure URL.
	uploadImage(buffer: Buffer): Promise<string> {
		return new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(
				{ folder: "seapedia/products", resource_type: "image" },
				(error, result) => {
					if (error || !result) {
						this.logger.error("Cloudinary upload failed", error);
						return reject(
							new InternalServerErrorException(
								"Image upload failed",
							),
						);
					}
					resolve(result.secure_url);
				},
			);
			stream.end(buffer);
		});
	}
}
