import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import {
  INotificationRepository,
  INotificationService,
  INotificationResponse,
} from "../interfaces";
import { CreateNotificationDto, UpdateNotificationDto } from "../dto/notification.dto";
import { Notification, NotificationStatus, NotificationType } from "generated/prisma/client";
import { IRoleService } from "src/role/interfaces";
import { IUserRoleService } from "src/user-role/interfaces";
import { Queue } from "bullmq";
import { InjectQueue } from "@nestjs/bullmq";


@Injectable()
export class NotificationService implements INotificationService {
  constructor(
    private notificationRepository: INotificationRepository,
    private roleService: IRoleService,
    private userRoleService: IUserRoleService,
    @InjectQueue('notification') private readonly notificationQueue: Queue
  ) { }

  async createNotification(createNotificationDto: CreateNotificationDto): Promise<INotificationResponse> {
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

      return {
        message: "Notification created"
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

  async getNotifications(userId: string, skip?: number, take?: number, status?: NotificationStatus, type?: NotificationType): Promise<Notification[]> {
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
            type: type
          },
          skip: skip ? Number(skip) : undefined,
          take: take ? Number(take) : undefined
        });
      } else {
        return await this.notificationRepository.getNotifications({
          where: {
            userId: userId,
            status: status,
            type: type
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
          error.meta || "Error occurred check the log in the server",
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
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async updateNotification(updateNotificationDto: UpdateNotificationDto): Promise<INotificationResponse> {
    try {
      const { id, status } = updateNotificationDto;

      return await this.notificationRepository.updateNotification({
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
