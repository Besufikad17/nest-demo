import { Controller, Delete, Get, HttpCode, HttpStatus, MessageEvent, Param, Sse, UseGuards } from '@nestjs/common';
import { IDeviceInfoService } from '../interfaces';
import { DeviceInfoGuard, JwtGuard } from 'src/common/guards';
import { ApiOkResponseWithData } from 'src/common/helpers/swagger.helper';
import { GetClientIp, GetDeviceInfo, GetUser } from 'src/common/decorators';
import { IDeviceInfo, IUser } from 'src/common/interfaces';
import { GetSessionsResponse } from '../entities/device-info.entity';
import { EmptyBodyResponse } from 'src/common/entities/api.entity';
import { ApiTags } from '@nestjs/swagger';
import { DeviceInfoSessionStreamService } from '../services/device-info-session-stream.service';
import { Observable } from 'rxjs';

@ApiTags('device-info')
@Controller('device-info')
export class DeviceInfoController {
  constructor(
    private deviceInfoService: IDeviceInfoService,
    private deviceInfoSessionStreamService: DeviceInfoSessionStreamService,
  ) { }

  @Get('sessions')
  @UseGuards(JwtGuard, DeviceInfoGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(GetSessionsResponse, true)
  async getSessions(@GetUser() user: IUser) {
    return await this.deviceInfoService.getSessions(user.id);
  }

  @Delete('session/:id/remove')
  @UseGuards(JwtGuard, DeviceInfoGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async removeSession(
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser,
    @Param('id') id: string
  ) {
    return await this.deviceInfoService.removeSession(id, user.id, deviceInfo, ip);
  }

  @Sse('sessions/stream')
  streamSessions(): Observable<MessageEvent> {
    return this.deviceInfoSessionStreamService.stream$;
  }
}
