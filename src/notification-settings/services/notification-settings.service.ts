import { Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { INotificationSettingsRepository, INotificationSettingsService } from "../interfaces";
import { IUserActivityService } from "src/user-activity/interfaces";
import { NotificationSettings } from "generated/prisma/client";
import { AddNotificationSettingDto, UpdateNotificationSettingsDto } from "../dto/notification-settings.dto";
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";
import { IDeviceInfoService } from "src/device-info/interfaces";
import { addOrGetDeviceId } from "src/common/helpers/device-id.helper";
import { ErrorCode } from "src/common/enums";

@Injectable()
export class NotificationSettingsService implements INotificationSettingsService {
  constructor(
    private deviceInfoService: IDeviceInfoService,
    private notficationSettingsRepository: INotificationSettingsRepository,
    private userActivityService: IUserActivityService
  ) { }

  async addNotificationSetting(addNotificationSettingDto: AddNotificationSettingDto): Promise<NotificationSettings> {
    try {
      return await this.notficationSettingsRepository.createNotificationSetting({
        data: {
          userId: addNotificationSettingDto.userId,
          notificationType: addNotificationSettingDto.notifcationType
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async getNotificationSetting(userId: string): Promise<IApiResponse<NotificationSettings[]>> {
    try {
      const data = await this.notficationSettingsRepository.findNotifcationSettings({
        where: {
          userId: userId
        }
      });

      return {
        success: false,
        message: 'Notification settings fetched.',
        data
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        }
      } else {
        return {
          success: false,
          message: "Error occurred check the log in the server",
          data: null,
          error: ErrorCode.GENERAL_ERROR,
        };
      }
    }
  }

  async updateNotificationSetting(updateNotificationSettingsDto: UpdateNotificationSettingsDto, settingsId: string, userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<null>> {
    try {
      const notificationSetting = await this.notficationSettingsRepository.findNotificationSetting({
        where: {
          id: settingsId,
          userId: userId
        }
      });

      if (!notificationSetting) throw new HttpException("Notification settings not found!!", HttpStatus.BAD_REQUEST);

      await this.notficationSettingsRepository.updateNotificationSetting({
        where: {
          id: notificationSetting.id
        },
        data: {
          ...updateNotificationSettingsDto
        }
      });

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      await this.userActivityService.addUserActivity({
        userId: userId,
        action: "UPDATE_NOTIFICATION_SETTINGS",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        success: true,
        message: 'Notification setting updated'
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
