import { Module } from '@nestjs/common';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import * as Interface from './interfaces';
import { FcmTokenRepository } from './repositories/fcm-token.repository';
import { NotificationRepository } from './repositories/notification.repository';
import { FcmTokenService } from './services/fcm-token.service';
import { QueueProvider } from './providers/queue.provider';
import { MailService } from './services/mail.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { RoleModule } from 'src/role/role.module';
import { UserRoleModule } from 'src/user-role/user-role.module';

@Module({
  providers: [
    { provide: Interface.IFcmTokenRepository, useClass: FcmTokenRepository },
    { provide: Interface.IFcmTokenService, useClass: FcmTokenService },
    { provide: Interface.IMailService, useClass: MailService },
    { provide: Interface.INotificationRepository, useClass: NotificationRepository },
    { provide: Interface.INotificationService, useClass: NotificationService },
    FcmTokenRepository,
    FcmTokenService,
    MailService,
    NotificationRepository,
    NotificationService,
    QueueProvider
  ],
  controllers: [NotificationController],
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get<string>('MAIL_HOST'),
          port: config.get<number>('MAIL_PORT'),
          secure: config.get<boolean>('MAIL_SECURE'),
          auth: {
            user: config.get<string>('MAIL_USER'),
            pass: config.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get<string>('MAIL_FROM')}>`,
        },
      }),
      inject: [ConfigService],
    }),
    RoleModule,
    UserRoleModule
  ],
  exports: [Interface.INotificationService]
})
export class NotificationModule { }
