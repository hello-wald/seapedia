import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WalletModule } from "../wallet/wallet.module";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { OverdueService } from "./overdue.service";

@Module({
	imports: [AuthModule, WalletModule],
	controllers: [AdminController],
	providers: [AdminService, OverdueService],
})
export class AdminModule {}
