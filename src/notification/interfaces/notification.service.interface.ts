import { SendPushNotificationDto } from "../dto/notification.dto";

export interface INotificationResponse {
  message: string;
}

export abstract class INotificationService {
  // abstract sendPushNotification(sendPushNotificationDto: SendPushNotificationDto): Promise<INotificationResponse>;
}
