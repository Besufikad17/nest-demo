import { Queue, Worker } from "bullmq";
import { Notification, NOTIFICATION_STATUS, NOTIFICATION_TYPE } from "@prisma/client";
import { SendLoginNotificationDto, SendOTPDto, SendPushNotificationDto } from "../dto/notification.dto";

export interface INotificationResponse {
  message: string;
}

export interface IQueueProvider {
  pushNotificationQueue: Queue;
  worker: Worker;
}

export abstract class INotificationService {
  abstract sendPushNotification(sendPushNotificationDto: SendPushNotificationDto): Promise<INotificationResponse>;
  abstract sendOTP(sendOTPDto: SendOTPDto): Promise<INotificationResponse>;
  abstract sendLoginNotification(sendLoginNotificationDto: SendLoginNotificationDto): Promise<INotificationResponse>;
  abstract getNotifications(userId: string, skip?: number, take?: number, status?: NOTIFICATION_STATUS, type?: NOTIFICATION_TYPE): Promise<Notification[]>;
  abstract getNotification(id: string, userId: string): Promise<Notification | null>;
}
