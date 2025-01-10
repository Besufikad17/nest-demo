import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IWebAuthnCredentialService } from '../interfaces/web-authn-credential.service.interface';

@ApiTags('passkey')
@Controller('auth/passkey')
export class WebAuthnCredentialController {
  constructor(private webAutnCredentialService: IWebAuthnCredentialService) { }
}
