import { IsNotEmpty, IsObject, IsString, ValidateIf } from "class-validator";

export class SendPushNotificationDto {
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @IsNotEmpty()
  readonly body: string;

  @IsNotEmpty()
  @IsString()
  readonly fcmToken: string;

  @IsObject()
  @ValidateIf((obj) => obj.data !== undefined && obj.data !== null && obj.data !== '')
  readonly data?: Object;
}
