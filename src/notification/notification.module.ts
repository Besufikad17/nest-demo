import { Module } from "@nestjs/common";
import { NotificationService } from "./services/notification.service";
import { NotificationController } from "./controllers/notification.controller";
import { NotificationRepository } from "./repositories/notification.repository";
import { MailService } from "./services/mail.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { RoleModule } from "src/role/role.module";
import { UserRoleModule } from "src/user-role/user-role.module";
import { BullModule } from "@nestjs/bullmq";
import { FcmTokenModule } from "src/fcm-token/fcm-token.module";
import { FirebaseModule } from "src/firebase/firebase.module";
import { NotificationProcessor } from "./processors/notification.processor";
import * as Interface from "./interfaces";

@Module({
  providers: [
    { provide: Interface.IMailService, useClass: MailService },
    { provide: Interface.INotificationRepository, useClass: NotificationRepository },
    { provide: Interface.INotificationService, useClass: NotificationService },
    MailService,
    NotificationRepository,
    NotificationService,
    NotificationProcessor
  ],
  controllers: [NotificationController],
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'notification',
    }),
    FcmTokenModule,
    FirebaseModule,
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          service: "gmail",
          port: 587,
          secure: false,
          auth: {
            user: config.get<string>("MAIL_USER"),
            pass: config.get<string>("MAIL_PASS"),
          },
        },
        defaults: {
          from: `"No Reply" <${config.get<string>("MAIL_FROM")}>`,
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
