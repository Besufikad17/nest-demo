import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { INotificationRepository, SendNotificationJobData } from '../interfaces';
import { MailService } from '../services';
import { IFCMTokenService } from 'src/fcm-token/interfaces';
import { IFirebaseService } from 'src/firebase/interfaces';
import { getEmailHtml } from '../utils/mail.util';

interface NotificationJobResult {
  success: boolean;
}

type NotificationJob = Job<
  SendNotificationJobData,
  NotificationJobResult,
  'notification'
>;

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);
  constructor(
    private readonly mailService: MailService,
    private readonly fcmTokenService: IFCMTokenService,
    private readonly firebaseService: IFirebaseService,
    private readonly notificationRepository: INotificationRepository
  ) {
    super()
  }

  async process(job: NotificationJob): Promise<void> {
    this.logger.debug('Start processing notifications...');
    const { userId, message, type, email, title } = job.data;

    switch (type) {
      case 'EMAIL': {
        await this.mailService.sendEmail({
          to: email,
          html: getEmailHtml(message),
          subject: title,
        });
        break;
      }
      case 'PUSH': {
        const fcmTokens = await this.fcmTokenService.getTokens(userId);

        for (const fcmToken of fcmTokens) {
          await this.firebaseService.sendPushNotification({
            title,
            body: message,
            fcmToken: fcmToken.token,
          });
        }
        break;
      }
      default:
        return;
    }

    this.logger.debug('Notification sent')
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    this.logger.debug('Start completed event...');

    const { id }: SendNotificationJobData = job.data;
    await this.notificationRepository.updateNotification({
      where: { id },
      data: {
        status: "SENT"
      }
    });

    const notification = await this.notificationRepository.getNotification({ where: { id } });
    if (!notification) this.logger.warn('Notificaion not found!!')

    this.logger.debug('Finishing completed event');
  }

  @OnWorkerEvent('failed')
  async onFailed(job: Job) {
    this.logger.debug('Start failed event...');

    if (job.attemptsMade >= (job.opts.attempts ?? 3)) {
      const { id }: SendNotificationJobData = job.data;
      await this.notificationRepository.updateNotification({
        where: { id },
        data: {
          status: "FAILED"
        }
      });
    }

    this.logger.debug('Finishing completed event');
  }
}
