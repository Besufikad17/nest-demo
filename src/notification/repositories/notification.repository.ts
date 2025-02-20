import { Injectable } from "@nestjs/common";
import { INotificationRepository } from "../interfaces";
import { Prisma, Notification } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class NotificationRepository implements INotificationRepository {
  constructor(private prisma: PrismaService) { }

  async createNotification(createNotificationArgs: Prisma.NotificationCreateArgs): Promise<Notification> {
    return await this.prisma.notification.create(createNotificationArgs);
  }

  async getNotifications(getNotificationsArgs: Prisma.NotificationFindManyArgs): Promise<Notification[]> {
    return await this.prisma.notification.findMany(getNotificationsArgs);
  }

  async getNotification(getNotificationArgs: Prisma.NotificationFindFirstArgs): Promise<Notification | null> {
    return await this.prisma.notification.findFirst(getNotificationArgs);
  }

  async updateNotification(updateNotificationArgs: Prisma.NotificationUpdateArgs): Promise<Notification> {
    return await this.prisma.notification.update(updateNotificationArgs);
  }

  async deleteNotification(deleteNotificationArgs: Prisma.NotificationDeleteArgs): Promise<any> {
    return await this.prisma.notification.delete(deleteNotificationArgs);
  }
}
