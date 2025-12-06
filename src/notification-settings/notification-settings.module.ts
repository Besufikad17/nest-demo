import { Module } from '@nestjs/common';
import { NotificationSettingsService } from './services/notification-settings.service';
import { NotificationSettingsController } from './controllers/notification-settings.controller';
import * as Interface from './interfaces';
import { UserActivityModule } from 'src/user-activity/user-activity.module';
import { NotificationSettingsRepository } from './repositories/notification-settings.repository';

@Module({
  providers: [
    { provide: Interface.INotificationSettingsRepository, useClass: NotificationSettingsRepository },
    { provide: Interface.INotificationSettingsService, useClass: NotificationSettingsService },
    NotificationSettingsService
  ],
  controllers: [NotificationSettingsController],
  imports: [UserActivityModule],
  exports: [Interface.INotificationSettingsRepository, Interface.INotificationSettingsService]
})
export class NotificationSettingsModule { }
