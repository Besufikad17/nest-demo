import { Notification, Prisma } from "@prisma/client";

export abstract class INotificationRepository {
  abstract createNotification(createNotificationArgs: Prisma.NotificationCreateArgs): Promise<Notification>;
  abstract getNotifications(getNotificationsArgs: Prisma.NotificationFindManyArgs): Promise<Notification[]>;
  abstract getNotification(getNotificationArgs: Prisma.NotificationFindFirstArgs): Promise<Notification>;
  abstract updateNotification(updateNotificationArgs: Prisma.NotificationUpdateArgs): Promise<Notification>;
  abstract deleteNotification(deleteNotificationArgs: Prisma.NotificationDeleteArgs): Promise<any>;
}
