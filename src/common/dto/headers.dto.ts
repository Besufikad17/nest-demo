import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class HeadersDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceInfo: string;
}