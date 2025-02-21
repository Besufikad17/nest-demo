import { Queue, Worker } from "bullmq";
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
}
