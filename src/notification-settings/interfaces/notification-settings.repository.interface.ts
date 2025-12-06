import { NotificationSettings, Prisma } from "@prisma/client";

export abstract class INotificationSettingsRepository {
  abstract createNotificationSetting(createNotificationSettingArgs: Prisma.NotificationSettingsCreateArgs): Promise<NotificationSettings>;
  abstract findNotifcationSettings(findNotificationSettingsArgs: Prisma.NotificationSettingsFindManyArgs): Promise<NotificationSettings[]>;
  abstract findNotificationSetting(findNotificationSettingArgs: Prisma.NotificationSettingsFindFirstArgs): Promise<NotificationSettings | null>;
  abstract updateNotificationSetting(updateNotificationSettingArgs: Prisma.NotificationSettingsUpdateArgs): Promise<NotificationSettings>;
  abstract deleteNotificationSetting(deleteNotificationSettingArgs: Prisma.NotificationSettingsDeleteArgs): Promise<any>;
}
