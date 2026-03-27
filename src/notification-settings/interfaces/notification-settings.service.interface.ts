import { NotificationSettings } from "generated/prisma/client";
import { AddNotificationSettingDto, UpdateNotificationSettingsDto } from "../dto/notification-settings.dto";
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";

export abstract class INotificationSettingsService {
  abstract addNotificationSetting(addNotificationSettingDto: AddNotificationSettingDto): Promise<NotificationSettings>;
  abstract getNotificationSetting(userId: string): Promise<IApiResponse<NotificationSettings[]>>;
  abstract updateNotificationSetting(
    updateNotificationSettingsDto: UpdateNotificationSettingsDto,
    settingsId: string,
    userId: string,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<null>>;
}
