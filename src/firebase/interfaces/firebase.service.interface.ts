import { SendPushNotificationDto } from "../dto/firebase.dto";

export interface IPushNotificationResponse {
  message: string;
}

export abstract class IFirebaseService {
  abstract sendPushNotification(sendPushNotificationDto: SendPushNotificationDto): Promise<IPushNotificationResponse>;
}
