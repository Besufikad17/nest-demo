import { Test, TestingModule } from '@nestjs/testing';
import { PrometheusController } from './prometheus.controller';

describe('PrometheusController', () => {
  let controller: PrometheusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrometheusController],
    }).compile();

    controller = module.get<PrometheusController>(PrometheusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
