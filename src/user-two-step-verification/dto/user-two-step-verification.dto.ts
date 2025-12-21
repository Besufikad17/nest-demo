import { USER_TWO_FACTOR_METHOD_TYPE } from "generated/prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";
import { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/server";

export class CreateUserTwoStepVerificationDto {
  @ApiProperty()
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== "")
  readonly userId?: string;

  @ApiProperty({ enum: USER_TWO_FACTOR_METHOD_TYPE })
  @IsNotEmpty()
  @IsEnum(USER_TWO_FACTOR_METHOD_TYPE)
  readonly methodType: USER_TWO_FACTOR_METHOD_TYPE;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  readonly methodDetail: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  readonly isPrimary: boolean;

  @ApiProperty()
  @IsNotEmpty()
  @IsBoolean()
  readonly isEnabled: boolean;

  @ApiProperty()
  @IsString()
  @ValidateIf((obj) => obj.secret !== undefined && obj.secret !== null && obj.secret !== "")
  readonly secret?: string;
}

export class FindUserTwoStepVerificationDto {
  @IsUUID()
  @ValidateIf((obj) => obj.id !== undefined && obj.id !== null && obj.id !== "")
  readonly id?: string;

  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== "")
  readonly userId?: string;

  @IsEnum(USER_TWO_FACTOR_METHOD_TYPE)
  @ValidateIf((obj) => obj.methodType !== undefined && obj.methodType !== null && obj.methodType !== "")
  readonly methodType?: USER_TWO_FACTOR_METHOD_TYPE;

  @IsString()
  @ValidateIf((obj) => obj.methodDetail !== undefined && obj.methodDetail !== null && obj.methodDetail !== "")
  readonly methodDetail?: string;

  @IsBoolean()
  @ValidateIf((obj) => obj.isPrimary !== undefined && obj.isPrimary !== null && obj.isPrimary !== "")
  readonly isPrimary?: boolean;

  @IsBoolean()
  @ValidateIf((obj) => obj.isEnabled !== undefined && obj.isEnabled !== null && obj.isEnabled !== "")
  readonly isEnabled?: boolean;
}

export class GetPrimary2FaDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly value: string;
}

export class UpdateUserTwoStepVerifcationDto {
  @ApiProperty()
  @IsUUID()
  @ValidateIf((obj) => obj.id !== undefined && obj.id !== null && obj.id !== "")
  readonly id?: string;

  @ApiProperty()
  @IsBoolean()
  readonly isEnabled: boolean;

  @ApiProperty()
  @IsBoolean()
  readonly isPrimary: boolean;
}

export class VerifyUserTwoStepVerificationDto {
  @ApiProperty()
  @IsString()
  @ValidateIf((obj) => obj.twoFaCode !== undefined && obj.twoFaCode !== null && obj.twoFaCode !== "")
  readonly twoFaCode: string;
}

export class AddPasskeyDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly response: RegistrationResponseJSON;
}

export class VerifyPasskeyDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly response: AuthenticationResponseJSON;
}
