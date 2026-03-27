import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { INotificationRepository, INotificationService, } from "../interfaces";
import { CreateNotificationDto, UpdateNotificationDto } from "../dto/notification.dto";
import { Notification, NotificationStatus, NotificationType } from "generated/prisma/client";
import { IRoleService } from "src/role/interfaces";
import { IUserRoleService } from "src/user-role/interfaces";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";
import { IApiResponse } from "src/common/interfaces";
import { ErrorCode } from "src/common/enums";

@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private notificationRepository: INotificationRepository,
    private roleService: IRoleService,
    private userRoleService: IUserRoleService,
    @InjectQueue('notification') private readonly notificationQueue: Queue
  ) { }

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<void> {
    try {
      const { email, ...notificationData } = createNotificationDto;

      const notification = await this.notificationRepository.createNotification({
        data: { ...notificationData }
      });

      await this.notificationQueue.add(
        'new',
        {
          id: notification.id,
          ...createNotificationDto,
        },
        {
          removeOnComplete: true,
          removeOnFail: {
            age: 3600
          }
        }
      );
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

  async getNotifications(userId: string, skip?: number, take?: number, status?: NotificationStatus, type?: NotificationType): Promise<IApiResponse<Notification[]>> {
    try {
      const userRoles = await this.userRoleService.getUserRoles({ userId: userId });

      const rolesPromise = userRoles.map(async (userRole) => {
        return await this.roleService.getRole({ id: userRole.roleId });
      });

      const resolvedRoles = await Promise.all(rolesPromise);

      let data = null;
      const roles = resolvedRoles.map(role => role?.roleName || "");
      if (roles.includes("admin")) {
        data = await this.notificationRepository.getNotifications({
          where: {
            status: status,
            type: type
          },
          skip: skip ? Number(skip) : undefined,
          take: take ? Number(take) : undefined
        });
      } else {
        data = await this.notificationRepository.getNotifications({
          where: {
            userId: userId,
            status: status,
            type: type
          },
          skip: skip ? Number(skip) : undefined,
          take: take ? Number(take) : undefined
        });
      }

      return {
        success: true,
        message: "Notifications fetched",
        data,
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

  async getNotification(id: string, userId: string): Promise<IApiResponse<Notification | null>> {
    try {
      const userRoles = await this.userRoleService.getUserRoles({ userId: userId });

      const rolesPromise = userRoles.map(async (userRole) => {
        return await this.roleService.getRole({ id: userRole.roleId });
      });

      const resolvedRoles = await Promise.all(rolesPromise);

      let data = null;
      const roles = resolvedRoles.map(role => role?.roleName || "");
      if (roles.includes("admin")) {
        data = await this.notificationRepository.getNotification({
          where: {
            id: id
          },
        });
      } else {
        data = await this.notificationRepository.getNotification({
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

      return {
        success: true,
        message: "Notification fetched",
        data,
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

  async updateNotification(updateNotificationDto: UpdateNotificationDto): Promise<void> {
    try {
      const { id, status } = updateNotificationDto;

      await this.notificationRepository.updateNotification({
        where: {
          id,
        },
        data: {
          status
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
}
