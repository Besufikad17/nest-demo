import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import * as Interface from './interfaces';
import { FcmTokenRepository } from './repositories/fcm-token.repository';
import { NotificationRepository } from './repositories/notification.repository';
import { FcmTokenService } from './services/fcm-token.service';
import { QueueProvider } from './providers/queue.provider';

@Module({
  providers: [
    { provide: Interface.IFcmTokenRepository, useClass: FcmTokenRepository },
    { provide: Interface.IFcmTokenService, useClass: FcmTokenService },
    { provide: Interface.INotificationRepository, useClass: NotificationRepository },
    { provide: Interface.INotificationService, useClass: NotificationService },
    FcmTokenRepository,
    FcmTokenService,
    NotificationRepository,
    NotificationService,
    QueueProvider
  ],
  controllers: [NotificationController]
})
export class NotificationModule { }
