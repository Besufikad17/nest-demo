import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class RegisterFcmTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly token: string;
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
