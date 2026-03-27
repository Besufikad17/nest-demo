import { ApiProperty } from "@nestjs/swagger";
import { NotificationSettings, NotificationType } from "generated/prisma/browser";

export class NotificationSettingResponse implements NotificationSettings {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  notificationType: NotificationType;

  @ApiProperty()
  isEnabled: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
