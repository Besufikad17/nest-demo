import { NotificationSettings } from "@prisma/client";
import { AddNotificationSettingDto, UpdateNotificationSettingsDto } from "../dto/notification-settings.dto";

export abstract class INotificationSettingsService {
  abstract addNotificationSetting(addNotificationSettingDto: AddNotificationSettingDto): Promise<NotificationSettings>;
  abstract getNotificationSetting(userId: string): Promise<NotificationSettings[]>;
  abstract updateNotificationSetting(
    updateNotificationSettingsDto: UpdateNotificationSettingsDto,
    settingsId: string,
    userId: string,
    deviceInfo: string,
    ip: string
  ): Promise<NotificationSettings>;
}
