import { IsBoolean, IsDate, IsEmail, IsEmpty, IsEnum, IsNotEmpty, IsObject, IsString, IsUUID, ValidateIf } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { IsValidPhoneNumber } from "src/common/validators/phone.validator";
import { USER_ACCOUNT_STATUS, Prisma } from "generated/prisma/client";

export class CreateUserDto {
  @IsString()
  @ValidateIf((obj) => obj.firstName !== undefined && obj.firstName !== null && obj.firstName !== "")
  readonly firstName?: string;

  @IsString()
  @ValidateIf((obj) => obj.firstName !== undefined && obj.firstName !== null && obj.firstName !== "")
  readonly lastName?: string;

  @IsEmail()
  @ValidateIf((obj) => obj.email !== undefined && obj.email !== null && obj.email !== "")
  readonly email?: string;

  @IsValidPhoneNumber()
  @ValidateIf((obj) => obj.phoneNumber !== undefined && obj.phoneNumber !== null && obj.phoneNumber !== "")
  readonly phoneNumber?: string;

  @IsString()
  @ValidateIf((obj) => obj.passwordHash !== undefined && obj.passwordHash !== null && obj.passwordHash !== "")
  readonly passwordHash?: string;
}

export class FindUserDto {
  @IsUUID()
  @ValidateIf((obj) => obj.id !== undefined && obj.id !== null && obj.id != "")
  readonly id?: string;

  @IsEmail()
  @ValidateIf((obj) => obj.email !== undefined && obj.email !== null && obj.email !== "")
  readonly email?: string;

  @IsEmpty()
  @ValidateIf((obj) => obj.phoneNumber !== undefined && obj.phoneNumber !== null && obj.phoneNumber !== "")
  readonly phoneNumber?: string;
}

export class UpdateUserDto {
  @IsString()
  @ValidateIf((obj) => obj.firstName !== undefined && obj.firstName !== null && obj.firstName !== "")
  readonly firstName?: string;

  @IsString()
  @ValidateIf((obj) => obj.firstName !== undefined && obj.firstName !== null && obj.firstName !== "")
  readonly lastName?: string;

  @ApiProperty()
  @IsEmail()
  @ValidateIf((obj) => obj.email !== undefined && obj.email !== null && obj.email !== "")
  readonly email?: string;

  @ApiProperty()
  @IsValidPhoneNumber()
  @ValidateIf((obj) => obj.phoneNumber !== undefined && obj.phoneNumber !== null && obj.phoneNumber !== "")
  readonly phoneNumber?: string;

  @IsNotEmpty()
  @ValidateIf((obj) => obj.passwordHash !== undefined && obj.passwordHash !== null && obj.passwordHash !== "")
  readonly passwordHash?: string;

  @IsDate()
  @ValidateIf((obj) => obj.lastLogin !== undefined && obj.lastLogin !== null && obj.lastLogin !== "")
  readonly lastLogin?: Date;

  @IsBoolean()
  @ValidateIf((obj) => obj.isActive !== undefined && obj.isActive !== null && obj.isActive !== "")
  readonly isActive?: boolean;

  @IsEnum(USER_ACCOUNT_STATUS)
  @ValidateIf((obj) => obj.accountStatus !== undefined && obj.accountStatus && obj.accountStatus !== "")
  readonly accountStatus?: USER_ACCOUNT_STATUS;

  @IsBoolean()
  @ValidateIf((obj) => obj.twoStepEnabled !== undefined && obj.twoStepEnabled !== null && obj.twoStepEnabled !== "")
  readonly twoStepEnabled?: boolean;
}

export class FindUsersDto {
  @ApiProperty()
  @IsObject()
  @ValidateIf((obj) => obj.sortOptions !== undefined && obj.sortOptions !== null && obj.sortOptions !== "")
  readonly sortOptions?: Prisma.UserOrderByWithRelationInput;
}
