import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ZodValidationPipe, cleanupOpenApiDoc } from "nestjs-zod";
import { AppModule } from "./app.module";
import { Logger } from "@nestjs/common";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix("api");
	app.useGlobalPipes(new ZodValidationPipe());
	app.enableCors({
		origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
		credentials: true,
	});

	const swaggerConfig = new DocumentBuilder()
		.setTitle("SEApedia API")
		.setDescription("REST API for the SEApedia marketplace.")
		.setVersion("1.0")
		.addBearerAuth(
			{
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
				description: "Paste the accessToken returned by /auth/login.",
			},
			"bearer",
		)
		.build();

	// cleanupOpenApiDoc post-processes the schemas generated from zod DTOs.
	const document = cleanupOpenApiDoc(
		SwaggerModule.createDocument(app, swaggerConfig),
	);
	SwaggerModule.setup("api/docs", app, document, {
		swaggerOptions: { persistAuthorization: true },
	});

	const port = Number(process.env.PORT ?? 3000);
	await app.listen(port);
	Logger.log(`🚀 API running on http://localhost:${port}/api`);
	Logger.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

void bootstrap();
