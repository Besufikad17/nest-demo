import { Module } from '@nestjs/common';
import { PrometheusController } from './controllers/prometheus.controller';

@Module({
  controllers: [PrometheusController]
})
export class PrometheusModule { }
