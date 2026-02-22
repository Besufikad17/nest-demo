import { Controller, Get, HttpCode, HttpException, HttpStatus, Param, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NotificationStatus, NotificationType } from "generated/prisma/client";
import { JwtGuard } from "src/common/guards";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IUser } from "src/common/interfaces";
import { INotificationService } from "../interfaces";

@ApiTags("notification")
@Controller("notification")
export class NotificationController {
  constructor(
    private notificationService: INotificationService
  ) { }

  @Get("all")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getNotifications(
    @GetUser() user: IUser,
    @Query("skip") skip?: number,
    @Query("take") take?: number,
    @Query("status") status?: NotificationStatus,
    @Query("type") type?: NotificationType
  ) {
    return await this.notificationService.getNotifications(user.id, skip, take, status, type);
  }

  @Get(":id")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getNotification(@Param("id") id: string, @GetUser() user: IUser) {
    const notification = await this.notificationService.getNotification(id, user.id);

    if (!notification) {
      throw new HttpException("Notification not found!!", HttpStatus.BAD_REQUEST);
    }

    return notification;
  }
}
