import { Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { IDeviceInfoService } from '../interfaces';
import { DeviceInfoGuard, JwtGuard } from 'src/common/guards';
import { ApiOkResponseWithData } from 'src/common/helpers/swagger.helper';
import { GetUser } from 'src/common/decorators';
import { IUser } from 'src/common/interfaces';
import { GetSessionsResponse } from '../entities/device-info.entity';

@Controller('device-info')
export class DeviceInfoController {
  constructor(private deviceInfoService: IDeviceInfoService) { }

  @Get('sessions')
  @UseGuards(JwtGuard, DeviceInfoGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(GetSessionsResponse, true)
  async getSessions(@GetUser() user: IUser) {
    return await this.deviceInfoService.getSessions(user.id);
  }
}
