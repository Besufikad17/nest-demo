import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";
import { NOTIFICATION_TYPE } from "generated/prisma/client";
import { MESSAGE_TYPE } from "../enums/notification.enum";

export class RegisterFcmTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly token: string;
}

export class SendOTPDto {
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== "")
  readonly userId?: string;

  @IsNotEmpty()
  @IsString()
  readonly emailOrPhone: string;

  @IsNotEmpty()
  @IsEnum(NOTIFICATION_TYPE)
  readonly type: NOTIFICATION_TYPE;

  @IsNotEmpty()
  @IsString()
  readonly subject: string;

  @IsNotEmpty()
  @IsString()
  readonly message: string;

  @IsNotEmpty()
  @IsEnum(MESSAGE_TYPE)
  readonly messageType: MESSAGE_TYPE;
}

export class SendLoginNotificationDto {
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== "")
  readonly userId?: string;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  readonly deviceInfo: string;

  @IsNotEmpty()
  @IsString()
  readonly ip: string;
}

export class SendPushNotificationDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  @IsString()
  readonly body: string;

  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;
}
