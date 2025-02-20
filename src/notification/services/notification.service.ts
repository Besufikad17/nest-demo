import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { INotificationRepository, INotificationService, INotificationResponse, IFcmTokenRepository, IQueueProvider } from '../interfaces';
import { SendPushNotificationDto } from '../dto/notification.dto';


@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private fcmTokenRepository: IFcmTokenRepository,
    private notificationRepository: INotificationRepository,
    @Inject('QUEUE') private queueProvider: IQueueProvider
  ) { }

  async sendPushNotification(sendPushNotificationDto: SendPushNotificationDto): Promise<INotificationResponse> {
    try {
      const { body, title, userId } = sendPushNotificationDto;

      const fcmTokens = await this.fcmTokenRepository.findFcmTokens({
        where: {
          userId
        }
      });

      for (const fcmToken of fcmTokens) {
        await this.queueProvider.pushNotificationQueue.add(
          "pushNotificationQueue", {
          notificationsBatch: {
            body: body,
            fcmToken: fcmToken,
            fcmTokenId: fcmToken.id,
            title: title,
          }
        }
        );
      }

      return {
        message: "Push notification added in queue!!"
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
