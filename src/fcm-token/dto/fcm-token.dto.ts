import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateFCMTokenData {
  @IsNotEmpty()
  @IsString()
  readonly token: string;
}

export class CreateFcmTokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly token: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;
}
