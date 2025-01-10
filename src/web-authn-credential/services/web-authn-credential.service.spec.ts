import { Test, TestingModule } from '@nestjs/testing';
import { WebAuthnCredentialService } from './web-authn-credential.service';

describe('WebAuthnCredentialService', () => {
  let service: WebAuthnCredentialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebAuthnCredentialService],
    }).compile();

    service = module.get<WebAuthnCredentialService>(WebAuthnCredentialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
