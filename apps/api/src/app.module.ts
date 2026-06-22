import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { StoresModule } from "./stores/stores.module";
import { ProductsModule } from "./products/products.module";
import { UploadsModule } from "./uploads/uploads.module";
import { WalletModule } from "./wallet/wallet.module";
import { AddressesModule } from "./addresses/addresses.module";
import { CartModule } from "./cart/cart.module";

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		PrismaModule,
		AuthModule,
		StoresModule,
		ProductsModule,
		UploadsModule,
		WalletModule,
		AddressesModule,
		CartModule,
	],
	controllers: [AppController],
})
export class AppModule {}
