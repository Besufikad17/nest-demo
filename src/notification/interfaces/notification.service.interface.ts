import { Queue, Worker } from "bullmq";
import { SendPushNotificationDto } from "../dto/notification.dto";

export interface INotificationResponse {
  message: string;
}

export interface IQueueProvider {
  pushNotificationQueue: Queue;
  worker: Worker;
}

export abstract class INotificationService {
  abstract sendPushNotification(sendPushNotificationDto: SendPushNotificationDto): Promise<INotificationResponse>;
}
