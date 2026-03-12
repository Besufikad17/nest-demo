import { Queue, Worker } from "bullmq";
import { Notification, NotificationStatus, NotificationType } from "generated/prisma/client";
import { CreateNotificationDto, UpdateNotificationDto } from "../dto/notification.dto";
import { IApiResponse } from "src/common/interfaces";

export interface IQueueProvider {
  pushNotificationQueue: Queue;
  worker: Worker;
}

export class SendNotificationJobData extends CreateNotificationDto {
  id: string;
}

export abstract class INotificationService {
  abstract createNotification(createNotificationDto: CreateNotificationDto): Promise<void>;
  abstract getNotifications(userId: string, skip?: number, take?: number, status?: NotificationStatus, type?: NotificationType): Promise<IApiResponse<Notification[]>>;
  abstract getNotification(id: string, userId: string): Promise<IApiResponse<Notification | null>>;
  abstract updateNotification(updateNotificationDto: UpdateNotificationDto): Promise<void>;
}
