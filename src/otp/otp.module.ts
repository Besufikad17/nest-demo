import { Module } from "@nestjs/common";
import { OtpController } from "./controllers/otp.controller";
import { OtpService } from "./services/otp.service";
import { OtpRepository } from "./repositories/otp.repository";
import * as Interface from "./interfaces";
import { OtpRequestModule } from "src/otp-request/otp-request.module";
import { UserActivityModule } from "src/user-activity/user-activity.module";
import { NotificationModule } from "src/notification/notification.module";

@Module({
  providers: [
    { provide: Interface.IOtpRepository, useClass: OtpRepository },
    { provide: Interface.IOtpService, useClass: OtpService },
    OtpService
  ],
  controllers: [OtpController],
  exports: [Interface.IOtpRepository, Interface.IOtpService],
  imports: [NotificationModule, OtpRequestModule, UserActivityModule]
})
export class OtpModule { }
