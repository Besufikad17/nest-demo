import { Queue, Worker } from "bullmq";
import { Notification, NotificationStatus, NotificationType } from "generated/prisma/client";
import { CreateNotificationDto, UpdateNotificationDto } from "../dto/notification.dto";

export interface INotificationResponse {
  message: string;
}

export interface IQueueProvider {
  pushNotificationQueue: Queue;
  worker: Worker;
}

export class SendNotificationJobData extends CreateNotificationDto {
  id: string;
}

export abstract class INotificationService {
  abstract createNotification(createNotificationDto: CreateNotificationDto): Promise<INotificationResponse>;
  abstract getNotifications(userId: string, skip?: number, take?: number, status?: NotificationStatus, type?: NotificationType): Promise<Notification[]>;
  abstract getNotification(id: string, userId: string): Promise<Notification | null>;
  abstract updateNotification(updateNotificationDto: UpdateNotificationDto): Promise<INotificationResponse>;
}
