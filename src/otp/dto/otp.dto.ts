import { OTPType, OTPIdentifier, OTPStatus } from "generated/prisma/client"
import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEnum, IsUUID, IsDate, ValidateIf } from "class-validator";

export class GenerateOtpDto {
  @ApiProperty({ enum: OTPType })
  @IsEnum(OTPType)
  @IsNotEmpty()
  readonly type: OTPType;

  @ApiProperty({ enum: OTPIdentifier })
  @IsEnum(OTPIdentifier)
  @IsNotEmpty()
  readonly identifier: OTPIdentifier;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly value: string;

  @ApiProperty()
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== "")
  readonly userId?: string;
}

export class CreateOtpDto {
  @ApiProperty()
  @IsEnum(OTPType)
  @IsNotEmpty()
  readonly type: OTPType;

  @ApiProperty()
  @IsEnum(OTPIdentifier)
  @IsNotEmpty()
  readonly identifier: OTPIdentifier;

  @ApiProperty()
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== "")
  userId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly value: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly otpCode: string;

  @ApiProperty()
  @IsDate()
  @IsNotEmpty()
  readonly expiresAt: Date;
}

export class FindOtpDto {
  @ApiProperty()
  @IsUUID()
  readonly id?: string;

  @ApiProperty()
  @IsEnum(OTPType)
  @IsNotEmpty()
  readonly type: OTPType;

  @ApiProperty()
  @IsEnum(OTPIdentifier)
  @IsNotEmpty()
  @ValidateIf((obj) => obj.identifier !== undefined && obj.identifier !== null && obj.identifier !== "")
  readonly identifier?: OTPIdentifier;

  @ApiProperty()
  @IsUUID()
  userId?: string;

  @ApiProperty()
  @IsString()
  @ValidateIf((obj) => obj.value !== undefined && obj.value !== null && obj.value !== "")
  readonly value?: string;
}

export class UpdateOtpDto {
  @ApiProperty()
  @IsEnum(OTPStatus)
  @IsNotEmpty()
  readonly status?: OTPStatus;

  @ApiProperty()
  @IsNotEmpty()
  readonly attempts?: number;
}

export class VerifyOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly value: string;

  @ApiProperty()
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== "")
  readonly userId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly otpCode: string;

  @ApiProperty({ enum: OTPType })
  @IsEnum(OTPType)
  @IsNotEmpty()
  readonly type: OTPType;
}
