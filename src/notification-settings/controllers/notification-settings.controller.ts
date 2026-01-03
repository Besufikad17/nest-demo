import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Param, Patch, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtGuard, RoleGuard } from "src/common/guards";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { IUser } from "src/common/interfaces";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { UpdateNotificationSettingsDto } from "../dto/notification-settings.dto";
import { INotificationSettingsService } from "../interfaces/notification-settings.service.interface";

@ApiTags("notification-settings")
@Controller("user/notification")
export class NotificationSettingsController {
  constructor(private notificationSettingsService: INotificationSettingsService) { }

  @Get("all")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  async getNotificationSetting(
    @GetUser() user: IUser
  ) {
    return await this.notificationSettingsService.getNotificationSetting(user.id);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  async updateNotificationSettings(
    @Body() updateNotificationSettingsDto: UpdateNotificationSettingsDto,
    @Param("id") settingsId: string,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string,
    @GetUser() user: IUser
  ) {
    return await this.notificationSettingsService.updateNotificationSetting(updateNotificationSettingsDto, settingsId, user.id, deviceInfo, ip);
  }
}
