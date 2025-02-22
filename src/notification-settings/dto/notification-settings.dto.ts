import { NOTIFICATION_TYPE } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsNotEmpty, IsString, ValidateIf } from "class-validator";

export class AddNotificationSettingDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsNotEmpty()
  @IsEnum(NOTIFICATION_TYPE)
  readonly notifcationType: NOTIFICATION_TYPE;
}

export class UpdateNotificationSettingsDto {
  @ApiProperty()
  @IsEnum(NOTIFICATION_TYPE)
  @ValidateIf((obj) => obj.notificationType !== undefined && obj.notificationType !== null && obj.notificationType !== '')
  readonly notificationType?: NOTIFICATION_TYPE;

  @ApiProperty()
  @IsBoolean()
  @ValidateIf((obj) => obj.isEnabled !== undefined && obj.isEnabled !== null && obj.isEnabled !== '')
  readonly isEnabled?: boolean;
}
