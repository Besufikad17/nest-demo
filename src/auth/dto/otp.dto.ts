import { OTP_TYPE, OTP_IDENTIFIER, OTP_STATUS } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsUUID, IsDate, ValidateIf } from 'class-validator';

export class GenerateOTPDto {
  @ApiProperty({ enum: OTP_TYPE })
  @IsEnum(OTP_TYPE)
  @IsNotEmpty()
  readonly type: OTP_TYPE;

  @ApiProperty({ enum: OTP_IDENTIFIER })
  @IsEnum(OTP_IDENTIFIER)
  @IsNotEmpty()
  readonly identifier: OTP_IDENTIFIER;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly value: string;

  @ApiProperty()
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== '')
  readonly userId?: string;
}

export class CreateOTPDto {
  @ApiProperty()
  @IsEnum(OTP_TYPE)
  @IsNotEmpty()
  readonly type: OTP_TYPE;

  @ApiProperty()
  @IsEnum(OTP_IDENTIFIER)
  @IsNotEmpty()
  readonly identifier: OTP_IDENTIFIER;

  @ApiProperty()
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== '')
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

export class FindOTPDto {
  @ApiProperty()
  @IsUUID()
  readonly id?: string;

  @ApiProperty()
  @IsEnum(OTP_TYPE)
  @IsNotEmpty()
  readonly type: OTP_TYPE;

  @ApiProperty()
  @IsEnum(OTP_IDENTIFIER)
  @IsNotEmpty()
  @ValidateIf((obj) => obj.identifier !== undefined && obj.identifier !== null && obj.identifier !== '')
  readonly identifier?: OTP_IDENTIFIER;

  @ApiProperty()
  @IsUUID()
  userId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly value: string;
}

export class UpdateOTPDto {
  @ApiProperty()
  @IsEnum(OTP_STATUS)
  @IsNotEmpty()
  readonly status?: OTP_STATUS;

  @ApiProperty()
  @IsNotEmpty()
  readonly attempts?: number;
}

export class VerifyOTPDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly value: string;

  @ApiProperty()
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== '')
  readonly userId?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly otpCode: string;

  @ApiProperty({ enum: OTP_TYPE })
  @IsEnum(OTP_TYPE)
  @IsNotEmpty()
  readonly type: OTP_TYPE;
}
