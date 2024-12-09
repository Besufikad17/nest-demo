import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";
import { USER_ACCOUNT_STATUS } from "@prisma/client";
import { IsValidPhoneNumber } from "src/common/validators/phone.validator";

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  readonly email: string;

  @IsNotEmpty()
  @IsValidPhoneNumber()
  readonly phoneNumber: string;

  @IsNotEmpty()
  @IsString()
  readonly passwordHash: string;
}

export class FindUserDto {
  @IsUUID()
  @ValidateIf((obj) => obj.id !== undefined && obj.id !== null && obj.id !== '')
  readonly id?: string;

  @IsString()
  @ValidateIf((obj) => obj.email !== undefined && obj.email !== null && obj.email !== '')
  readonly email?: string;

  @IsValidPhoneNumber()
  @ValidateIf((obj) => obj.phoneNumber !== undefined && obj.phoneNumber !== null && obj.phoneNumber !== '')
  readonly phoneNumber?: string;
}

export class UpdateUserDto {
  @IsString()
  @ValidateIf((obj) => obj.firstName !== undefined && obj.firstName !== null && obj.firstName !== '')
  readonly firstName?: string;

  @IsString()
  @ValidateIf((obj) => obj.lastName !== undefined && obj.lastName !== null && obj.lastName !== '')
  readonly lastName?: string;

  @IsString()
  @ValidateIf((obj) => obj.email !== undefined && obj.email !== null && obj.email !== '')
  readonly email?: string;

  @IsString()
  @ValidateIf((obj) => obj.phoneNumber !== undefined && obj.phoneNumber !== null && obj.phoneNumber !== '')
  readonly phoneNumber?: string;

  @IsString()
  @ValidateIf((obj) => obj.passwordHash !== undefined && obj.passwordHash !== null && obj.passwordHash !== '')
  readonly passwordHash?: string;

  @IsDate()
  @ValidateIf((obj) => obj.lastLogin !== undefined && obj.lastLogin !== null && obj.lastLogin !== '')
  readonly lastLogin?: Date;

  @IsBoolean()
  @ValidateIf((obj) => obj.isActive !== undefined && obj.isActive !== null && obj.isActive !== '')
  readonly isActive?: boolean;

  @IsEnum(USER_ACCOUNT_STATUS)
  @ValidateIf((obj) => obj.accountStatus !== undefined && obj.accountStatus !== null && obj.accountStatus !== '')
  readonly accountStatus?: USER_ACCOUNT_STATUS;
}
