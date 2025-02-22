import {
  IsNotEmpty,
  IsEmail,
  IsStrongPassword,
  IsString,
  IsUUID,
  IsDate,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty()
  @IsEmail()
  @ValidateIf((obj) => obj.email !== undefined && obj.email !== null && obj.email !== '')
  readonly email?: string;

  @ApiProperty()
  @IsString()
  @ValidateIf((obj) => obj.phoneNumber !== undefined && obj.phoneNumber !== null && obj.phoneNumber !== '')
  readonly phoneNumber?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly password: string;
}

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @ApiProperty()
  @IsString()
  @ValidateIf((obj) => obj.phoneNumber !== undefined && obj.phoneNumber !== null && obj.phoneNumber !== "")
  readonly phoneNumber?: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword()
  readonly password: string;
}

export class ResetPasswordDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly currentPassword: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  readonly newPassword: string;
}

export class RecoverAccountDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly value: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsStrongPassword()
  readonly newPassword: string;
}

export class CreateRefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  readonly refreshToken: string;

  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;

  @IsNotEmpty()
  @IsDate()
  readonly expiresAt: Date;
}

export class FindRefreshTokenDto {
  @IsString()
  @ValidateIf((obj) => obj.refreshToken !== undefined && obj.refreshToken !== null && obj.refreshToken !== '')
  readonly refreshToken?: string;

  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== '')
  readonly userId?: string;

  @IsDate()
  @ValidateIf((obj) => obj.expiresAt !== undefined && obj.expiresAt !== null && obj.expiresAt !== '')
  readonly expiresAt?: Date;
}
