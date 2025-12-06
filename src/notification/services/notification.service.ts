import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  INotificationRepository,
  INotificationService,
  INotificationResponse,
  IFcmTokenRepository,
  IQueueProvider,
  IMailService
} from '../interfaces';
import { SendLoginNotificationDto, SendOTPDto, SendPushNotificationDto } from '../dto/notification.dto';
import { Notification, NOTIFICATION_STATUS, NOTIFICATION_TYPE } from '@prisma/client';
import { getEmailHtml } from '../utils/mail.util';
import { IRoleService } from 'src/role/interfaces';
import { IUserRoleService } from 'src/user-role/interfaces';


@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private fcmTokenRepository: IFcmTokenRepository,
    private notificationRepository: INotificationRepository,
    private roleService: IRoleService,
    private userRoleService: IUserRoleService,
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

  async sendLoginNotification(sendLoginNotificationDto: SendLoginNotificationDto): Promise<INotificationResponse> {
    try {
      const html = `<p><strong>	We noticed a login to your account from a new device.</strong></p>
        <p>Device: ${sendLoginNotificationDto.deviceInfo}</p>
        <p>Ip Address: ${sendLoginNotificationDto.ip}</p>
      `;

      const notification = await this.notificationRepository.createNotification({
        data: {
          userId: sendLoginNotificationDto.userId,
          message: html,
          notificationType: "EMAIL"
        }
      });

      await this.mailService.sendEmail({
        to: sendLoginNotificationDto.email,
        subject: "Login Attempt",
        html: getEmailHtml(html)
      });

      await this.notificationRepository.updateNotification({
        where: {
          id: notification.id
        },
        data: {
          status: "SENT"
        }
      });

      return {
        message: "Notification sent!!"
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

  async getNotifications(userId: string, skip?: number, take?: number, status?: NOTIFICATION_STATUS, type?: NOTIFICATION_TYPE): Promise<Notification[]> {
    try {
      const userRoles = await this.userRoleService.getUserRoles({ userId: userId });

      const rolesPromise = userRoles.map(async (userRole) => {
        return await this.roleService.getRole({ id: userRole.roleId });
      });

      const resolvedRoles = await Promise.all(rolesPromise);

      const roles = resolvedRoles.map(role => role?.roleName || "");
      if (roles.includes("admin")) {
        return await this.notificationRepository.getNotifications({
          where: {
            status: status,
            notificationType: type
          },
          skip: skip ? Number(skip) : undefined,
          take: take ? Number(take) : undefined
        });
      } else {
        return await this.notificationRepository.getNotifications({
          where: {
            userId: userId,
            status: status,
            notificationType: type
          },
          skip: skip,
          take: take
        });
      }
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

  async getNotification(id: string, userId: string): Promise<Notification | null> {
    try {
      const userRoles = await this.userRoleService.getUserRoles({ userId: userId });

      const rolesPromise = userRoles.map(async (userRole) => {
        return await this.roleService.getRole({ id: userRole.roleId });
      });

      const resolvedRoles = await Promise.all(rolesPromise);

      const roles = resolvedRoles.map(role => role?.roleName || "");

      if (roles.includes("admin")) {
        console.log("admin?");
        return await this.notificationRepository.getNotification({
          where: {
            id: id
          },
        });
      } else {
        return await this.notificationRepository.getNotification({
          where: {
            AND: [
              {
                id
              },
              {
                userId
              }
            ]
          },
        });
      }
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
