import { Module } from '@nestjs/common';
import { WebAuthnCredentialService } from './services/web-authn-credential.service';
import { WebAuthnCredentialController } from './controllers/web-authn-credential.controller';
import { IWebAuthnCredentialService } from './interfaces/web-authn-credential.service.interface';
import { IWebAuthnCredentialRepository } from './interfaces/web-authn-credential.repository.interface';
import { WebAuthnCredentialRepository } from './repositories/web-authn-credential.repository';

@Module({
  providers: [
    { provide: IWebAuthnCredentialService, useClass: WebAuthnCredentialService },
    { provide: IWebAuthnCredentialRepository, useClass: WebAuthnCredentialRepository },
    WebAuthnCredentialService
  ],
  controllers: [WebAuthnCredentialController],
  exports: [IWebAuthnCredentialService]
})
export class WebAuthnCredentialModule { }
