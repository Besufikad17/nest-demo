import { Test, TestingModule } from '@nestjs/testing';
import { DeviceInfoService } from './device-info.service';

describe('DeviceInfoService', () => {
  let service: DeviceInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeviceInfoService],
    }).compile();

    service = module.get<DeviceInfoService>(DeviceInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
