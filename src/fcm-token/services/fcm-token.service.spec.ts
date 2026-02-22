import { Test, TestingModule } from '@nestjs/testing';
import { FcmTokenService } from './fcm-token.service';

describe('FcmTokenService', () => {
  let service: FcmTokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FcmTokenService],
    }).compile();

    service = module.get<FcmTokenService>(FcmTokenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
