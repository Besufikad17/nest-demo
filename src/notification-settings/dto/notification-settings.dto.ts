import { NotificationType } from "generated/prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class AddNotificationSettingDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  readonly notifcationType: NotificationType;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty()
  @IsEnum(NotificationType)
  @ValidateIf((obj) => obj.notificationType !== undefined && obj.notificationType !== null && obj.notificationType !== "")
  readonly notificationType?: NotificationType;

  @ApiProperty()
  @IsBoolean()
  @ValidateIf((obj) => obj.isEnabled !== undefined && obj.isEnabled !== null && obj.isEnabled !== "")
  readonly isEnabled?: boolean;
}
