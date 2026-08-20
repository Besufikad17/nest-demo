import { Module } from "@nestjs/common";
import { WebAuthnCredentialService } from "./services/web-authn-credential.service";
import { WebAuthnCredentialController } from "./controllers/web-authn-credential.controller";
import { IWebAuthnCredentialService } from "./interfaces/web-authn-credential.service.interface";
import { IWebAuthnCredentialRepository } from "./interfaces/web-authn-credential.repository.interface";
import { WebAuthnCredentialRepository } from "./repositories/web-authn-credential.repository";
import { WebAuthnChallengeService } from "./services/web-authn-challenge.service";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  providers: [
    { provide: IWebAuthnCredentialService, useClass: WebAuthnCredentialService },
    { provide: IWebAuthnCredentialRepository, useClass: WebAuthnCredentialRepository },
    WebAuthnChallengeService,
  ],
  controllers: [WebAuthnCredentialController],
  exports: [IWebAuthnCredentialService, WebAuthnChallengeService],
})
export class WebAuthnCredentialModule { }
