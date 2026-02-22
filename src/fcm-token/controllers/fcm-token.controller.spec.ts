import { Test, TestingModule } from '@nestjs/testing';
import { FcmTokenController } from './fcm-token.controller';

describe('FcmTokenController', () => {
  let controller: FcmTokenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FcmTokenController],
    }).compile();

    controller = module.get<FcmTokenController>(FcmTokenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
