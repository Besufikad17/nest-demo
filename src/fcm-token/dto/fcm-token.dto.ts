import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateFCMTokenData {
  @IsNotEmpty()
  @IsString()
  readonly token: string;
}

export class CreateFcmTokenDto {
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;
}
