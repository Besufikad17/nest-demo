import { USER_SSO_PROVIDER } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";

export class CreateUserSSODto {
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;

  @IsNotEmpty()
  @IsEnum(USER_SSO_PROVIDER)
  readonly provider: USER_SSO_PROVIDER;

  @IsNotEmpty()
  @IsString()
  readonly providerUserId: string;

  @IsNotEmpty()
  @IsString()
  readonly email: string;
}

export class FindUserSSODto {
  @IsNotEmpty()
  @IsUUID()
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== '')
  readonly userId?: string;

  @IsNotEmpty()
  @IsEnum(USER_SSO_PROVIDER)
  @ValidateIf((obj) => obj.provider !== undefined && obj.provider !== null && obj.provider !== '')
  readonly provider?: USER_SSO_PROVIDER;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj) => obj.providerUserId !== undefined && obj.providerUserId !== null && obj.providerUserId !== '')
  readonly providerUserId?: string;

  @IsNotEmpty()
  @IsString()
  readonly email?: string;
}
