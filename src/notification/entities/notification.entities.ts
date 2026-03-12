import { ApiProperty } from "@nestjs/swagger";
import { Notification, NotificationStatus, NotificationType } from "generated/prisma/browser";

export class NotificationResponse implements Notification {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  type: NotificationType;

  @ApiProperty()
  status: NotificationStatus;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
