import { OTP_ACTIVITY, OTP_IDENTIFIER, OTP_STATUS } from '@prisma/client';
import { IsString, IsNotEmpty, IsEnum, IsUUID } from 'class-validator';

export class GenerateOTPDto {
  @IsEnum(OTP_ACTIVITY)
  @IsNotEmpty()
  activity: OTP_ACTIVITY;

  @IsEnum(OTP_IDENTIFIER)
  @IsNotEmpty()
  identifier: OTP_IDENTIFIER;

  @IsUUID()
  userId?: string;
}

export class CreateOTPDto {
  @IsEnum(OTP_ACTIVITY)
  @IsNotEmpty()
  readonly activity: OTP_ACTIVITY;

  @IsEnum(OTP_IDENTIFIER)
  @IsNotEmpty()
  readonly identifier: OTP_IDENTIFIER;

  @IsUUID()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  readonly value: string;

  @IsString()
  @IsNotEmpty()
  readonly otpCode: string;
}

export class UpdateOTPDto {
  @IsEnum(OTP_STATUS)
  @IsNotEmpty()
  readonly status?: OTP_STATUS;

  @IsNotEmpty()
  readonly attempts?: number;
}

export class VerifyOTPDto {
  @IsUUID()
  readonly userId: string;

  @IsNotEmpty()
  @IsString()
  readonly value: string;

  @IsEnum(OTP_ACTIVITY)
  @IsNotEmpty()
  readonly activity: OTP_ACTIVITY;
}
