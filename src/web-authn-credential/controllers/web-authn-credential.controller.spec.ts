import { Test, TestingModule } from '@nestjs/testing';
import { WebAuthnCredentialController } from './web-authn-credential.controller';

describe('WebAuthnCredentialController', () => {
  let controller: WebAuthnCredentialController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebAuthnCredentialController],
    }).compile();

    controller = module.get<WebAuthnCredentialController>(WebAuthnCredentialController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
