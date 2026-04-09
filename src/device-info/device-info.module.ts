import { Module } from '@nestjs/common';
import { DeviceInfoService } from './services/device-info.service';
import { DeviceInfoRepository } from './repositories/device-info.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DeviceInfoController } from './controllers/device-info.controller';
import * as Interface from './interfaces';
import { UserActivityModule } from 'src/user-activity/user-activity.module';
import { DeviceInfoSessionStreamService } from './services/device-info-session-stream.service';

@Module({
  providers: [
    DeviceInfoRepository,
    DeviceInfoService,
    DeviceInfoSessionStreamService,
    { provide: Interface.IDeviceInfoRepository, useClass: DeviceInfoRepository },
    { provide: Interface.IDeviceInfoService, useClass: DeviceInfoService }
  ],
  exports: [Interface.IDeviceInfoRepository, Interface.IDeviceInfoService, DeviceInfoSessionStreamService],
  imports: [
    PrismaModule,
    UserActivityModule
  ],
  controllers: [DeviceInfoController],
})
export class DeviceInfoModule { }
