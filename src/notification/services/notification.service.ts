import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { INotificationRepository, INotificationService, INotificationResponse, IFcmTokenRepository, IQueueProvider, IMailService } from '../interfaces';
import { SendOTPDto, SendPushNotificationDto } from '../dto/notification.dto';
import { getEmailHtml } from '../utils/mail.util';


@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private fcmTokenRepository: IFcmTokenRepository,
    private notificationRepository: INotificationRepository,
    private mailService: IMailService,
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

  async sendOTP(sendOTPDto: SendOTPDto): Promise<INotificationResponse> {
    try {
      const notification = await this.notificationRepository.createNotification({
        data: {
          userId: sendOTPDto.userId,
          message: sendOTPDto.message,
          notificationType: sendOTPDto.type === "EMAIL" ? "EMAIL" : "SMS"
        }
      });

      if (sendOTPDto.type === "EMAIL") {
        let html = '';
        switch (sendOTPDto.messageType) {
          case "ACCOUNT_VERIFICATION":
            html = `<p><strong>Help us verify your email address, </strong></p>
              <p>Thank you for choosing Sefer.</p>
              <p>Please confirm your email address by using the following code:</p>
              <div style = "text-align: center; width: 100%;">
                <p>${sendOTPDto.message}</p>
              </div>
              <p>
                This verification ensures the security of your account and enables us
                to provide important updates about your service.
              </p>
              <p>If you didn't request this, you can ignore this email.</p>
            `;
            break;
          default:
            html = `<p><strong>Help us verify your action, </strong></p>
              <p>Thank you for choosing Sefer.</p>
              <p>Please confirm your action address by using the following code:</p>
              <div style = "text-align: center; width: 100%;">
                <p style = "font-style: bold;">${sendOTPDto.message}</p>
              </div>
              <p>
                This verification ensures the security of your account and enables us
                to provide important updates about your service.
              </p>
              <p>If you didn't request this, you can ignore this email.</p>
            `;
        }

        await this.mailService.sendEmail({
          to: sendOTPDto.emailOrPhone,
          subject: sendOTPDto.subject,
          html: getEmailHtml(html)
        });
      } else if (sendOTPDto.type === "SMS") {
        console.log(sendOTPDto);
      }

      await this.notificationRepository.updateNotification({
        where: {
          id: notification.id
        },
        data: {
          status: "SENT"
        }
      });

      return {
        message: 'OTP sent'
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
