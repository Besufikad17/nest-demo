import { Test, TestingModule } from '@nestjs/testing';
import { OtpRequestService } from './otp-request.service';

describe('OtpRequestService', () => {
  let service: OtpRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpRequestService],
    }).compile();

    service = module.get<OtpRequestService>(OtpRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
