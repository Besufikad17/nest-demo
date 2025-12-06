import { Injectable } from "@nestjs/common";
import { INotificationSettingsRepository } from "../interfaces";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, NotificationSettings } from "@prisma/client";

@Injectable()
export class NotificationSettingsRepository implements INotificationSettingsRepository {
  constructor(private prisma: PrismaService) { }

  async createNotificationSetting(createNotificationSettingArgs: Prisma.NotificationSettingsCreateArgs): Promise<NotificationSettings> {
    return await this.prisma.notificationSettings.create(createNotificationSettingArgs);
  }

  async findNotifcationSettings(findNotificationSettingsArgs: Prisma.NotificationSettingsFindManyArgs): Promise<NotificationSettings[]> {
    return await this.prisma.notificationSettings.findMany(findNotificationSettingsArgs);
  }

  async findNotificationSetting(findNotificationSettingArgs: Prisma.NotificationSettingsFindFirstArgs): Promise<NotificationSettings | null> {
    return await this.prisma.notificationSettings.findFirst(findNotificationSettingArgs);
  }

  async updateNotificationSetting(updateNotificationSettingArgs: Prisma.NotificationSettingsUpdateArgs): Promise<NotificationSettings> {
    return await this.prisma.notificationSettings.update(updateNotificationSettingArgs);
  }

  async deleteNotificationSetting(deleteNotificationSettingArgs: Prisma.NotificationSettingsDeleteArgs): Promise<any> {
    return await this.prisma.notificationSettings.delete(deleteNotificationSettingArgs);
  }
}
