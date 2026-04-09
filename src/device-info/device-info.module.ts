import { Module } from '@nestjs/common';
import { DeviceInfoService } from './services/device-info.service';
import { DeviceInfoRepository } from './repositories/device-info.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DeviceInfoController } from './controllers/device-info.controller';
import * as Interface from './interfaces';

@Module({
  providers: [
    DeviceInfoRepository,
    DeviceInfoService,
    { provide: Interface.IDeviceInfoRepository, useClass: DeviceInfoRepository },
    { provide: Interface.IDeviceInfoService, useClass: DeviceInfoService }
  ],
  exports: [Interface.IDeviceInfoRepository, Interface.IDeviceInfoService],
  imports: [PrismaModule],
  controllers: [DeviceInfoController],
})
export class DeviceInfoModule { }
