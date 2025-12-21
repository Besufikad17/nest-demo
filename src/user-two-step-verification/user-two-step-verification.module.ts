import { Module } from "@nestjs/common";
import { UserTwoStepVerificationController } from "./controllers/user-two-step-verification.controller";
import { UserTwoStepVerificationRepository } from "./repositories/user-two-step-verification.repository";
import { UserTwoStepVerificationService } from "./services/user-two-step-verification.service";
import * as Interfaces from "./interfaces";
import { PrismaModule } from "src/prisma/prisma.module";
import { UserModule } from "src/user/user.module";
import { WebAuthnCredentialModule } from "src/web-authn-credential/web-authn-credential.module";
import { UserActivityModule } from "src/user-activity/user-activity.module";

@Module({
  controllers: [UserTwoStepVerificationController],
  providers: [
    { provide: Interfaces.IUserTwoStepVerificationRepository, useClass: UserTwoStepVerificationRepository },
    { provide: Interfaces.IUserTwoStepVerificationService, useClass: UserTwoStepVerificationService },
    UserTwoStepVerificationRepository,
    UserTwoStepVerificationService
  ],
  exports: [Interfaces.IUserTwoStepVerificationRepository, Interfaces.IUserTwoStepVerificationService],
  imports: [PrismaModule, UserModule, WebAuthnCredentialModule, UserActivityModule]
})
export class UserTwoStepVerificationModule { }
