import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NOTIFICATION_STATUS, NOTIFICATION_TYPE } from "generated/prisma/client";
import { JwtGuard } from "src/auth/guards";
import { RegisterFcmTokenDto } from "../dto/notification.dto";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IUser } from "src/common/interfaces";
import { IFcmTokenService, INotificationService } from "../interfaces";

@ApiTags("notification")
@Controller("notification")
export class NotificationController {
  constructor(
    private fcmTokenService: IFcmTokenService,
    private notificationService: INotificationService
  ) { }

  @Post("fcm-token/register")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async registerToken(@Body() registerFcmTokenDto: RegisterFcmTokenDto, @GetUser() user: IUser) {
    return await this.fcmTokenService.registerFcmToken(registerFcmTokenDto, user.id);
  }

  @Get("all")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  async getNotifications(
    @GetUser() user: IUser,
    @Query("skip") skip?: number,
    @Query("take") take?: number,
    @Query("status") status?: NOTIFICATION_STATUS,
    @Query("type") type?: NOTIFICATION_TYPE
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
