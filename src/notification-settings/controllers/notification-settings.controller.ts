import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DeviceInfoGuard, JwtGuard, RoleGuard } from "src/common/guards";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { IDeviceInfo, IUser } from "src/common/interfaces";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { UpdateNotificationSettingsDto } from "../dto/notification-settings.dto";
import { INotificationSettingsService } from "../interfaces/notification-settings.service.interface";
import { GetClientIp, GetDeviceInfo } from "src/common/decorators";
import { ApiOkResponseWithData } from "src/common/helpers/swagger.helper";
import { NotificationSettingResponse } from "../entities/notification-settings.entities";
import { EmptyBodyResponse } from "src/common/entities/api.entity";

@ApiTags("notification-settings")
@Controller("user/notification")
export class NotificationSettingsController {
  constructor(private notificationSettingsService: INotificationSettingsService) { }

  @Get("all")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(NotificationSettingResponse, true)
  async getNotificationSetting(
    @GetUser() user: IUser
  ) {
    return await this.notificationSettingsService.getNotificationSetting(user.id);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, DeviceInfoGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async updateNotificationSettings(
    @Body() updateNotificationSettingsDto: UpdateNotificationSettingsDto,
    @Param("id") settingsId: string,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return await this.notificationSettingsService.updateNotificationSetting(updateNotificationSettingsDto, settingsId, user.id, deviceInfo, ip);
  }
}
