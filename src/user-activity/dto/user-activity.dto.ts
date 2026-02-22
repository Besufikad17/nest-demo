import { Prisma, UserActions } from "generated/prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, IsUUID, ValidateIf } from "class-validator";

export class AddUserActivityDto {
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;

  @IsNotEmpty()
  @IsUUID()
  @ValidateIf((obj) => obj.profileId !== undefined && obj.profileId !== null && obj.profileId !== "")
  readonly profileId?: string;

  @IsNotEmpty()
  @IsEnum(UserActions)
  readonly action: UserActions;

  @IsNotEmpty()
  @IsDate()
  readonly actionTimestamp: Date;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj) => obj.ipAddress !== undefined && obj.ipAddress !== null && obj.ipAddress !== "")
  readonly ipAddress?: string;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj) => obj.deviceInfo !== undefined && obj.deviceInfo !== null && obj.deviceInfo !== "")
  readonly deviceInfo?: string;
}

export class FindUserActivityDto {
  @ApiProperty()
  @IsUUID()
  @ValidateIf((obj) => obj.profileId !== undefined && obj.profileId !== null && obj.profileId !== "")
  readonly profileId?: string;

  @ApiProperty()
  @IsEnum(UserActions)
  @ValidateIf((obj) => obj.action !== undefined && obj.action !== null && obj.action !== "")
  readonly action?: UserActions;

  @ApiProperty()
  @IsDate()
  @ValidateIf((obj) => obj.actionTimestamp !== undefined && obj.actionTimestamp !== null && obj.actionTimestamp !== "")
  readonly actionTimestamp?: Date;

  @ApiProperty()
  @IsString()
  @ValidateIf((obj) => obj.ipAddress !== undefined && obj.ipAddress !== null && obj.ipAddress !== "")
  readonly ipAddress?: string;

  @ApiProperty()
  @IsString()
  @ValidateIf((obj) => obj.deviceInfo !== undefined && obj.deviceInfo !== null && obj.deviceInfo !== "")
  readonly deviceInfo?: string;

  @ApiProperty()
  @IsObject()
  @ValidateIf((obj) => obj.sortOptions !== undefined && obj.sortOptions !== null && obj.sortOptions !== "")
  readonly sortOptions?: Prisma.UserActivityLogOrderByWithRelationInput;
}

export class FileUploadEventDto {
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;

  @IsNotEmpty()
  @IsUUID()
  readonly profileId: string;

  @IsNotEmpty()
  @IsEnum(UserActions)
  readonly action: UserActions;

  @IsNotEmpty()
  @IsString()
  readonly deviceInfo: string;

  @IsNotEmpty()
  @IsString()
  readonly ip: string;

  @IsNotEmpty()
  @IsDate()
  readonly actionTimestamp: Date;
}
