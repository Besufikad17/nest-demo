import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IFirebaseService, IPushNotificationResponse } from '../interfaces';
import { SendPushNotificationDto } from '../dto/firebase.dto';
import { app } from 'firebase-admin';

@Injectable()
export class FirebaseService implements IFirebaseService {
  constructor(@Inject('FIREBASE_APP') private firebaseProvider: app.App) { }

  async sendPushNotification(sendPushNotificationDto: SendPushNotificationDto): Promise<IPushNotificationResponse> {
    try {
      const { body, data, fcmToken, title } = sendPushNotificationDto;

      await this.firebaseProvider.messaging().send({
        data: data ? Object.fromEntries(
          Object.entries(data).map(([key, val]) => [key, String(val)])
        ) : undefined,
        token: fcmToken,
        notification: {
          title: title,
          body: body,
        }
      });

      return {
        message: "Push notification sent!!"
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.meta || 'Error occurred check the log in the server',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
