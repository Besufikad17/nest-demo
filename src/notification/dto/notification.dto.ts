import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";
import { NotificationType, NotificationStatus } from "generated/prisma/client";

export class CreateNotificationDto {
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== '')
  readonly userId?: string;

  @IsEmail()
  @ValidateIf((obj) => obj.email !== undefined && obj.email !== null && obj.email !== '')
  readonly email?: string;

  @IsString()
  @ValidateIf((obj) => obj.phoneNumber !== undefined && obj.phoneNumber !== null && obj.phoneNumber !== '')
  readonly phoneNumber?: string;

  @IsNotEmpty()
  @IsEnum(NotificationType)
  readonly type: NotificationType;

  @IsNotEmpty()
  @IsString()
  readonly message: string;

  @IsNotEmpty()
  @IsString()
  readonly title: string;
}

export class UpdateNotificationDto {
  @IsNotEmpty()
  @IsUUID()
  readonly id: string;

  @IsNotEmpty()
  @IsEnum(NotificationStatus)
  readonly status: NotificationStatus;
}
