import { UserSSOProvider } from "generated/prisma/client";
import { IsEnum, IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";

export class CreateUserSSODto {
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;

  @IsNotEmpty()
  @IsEnum(UserSSOProvider)
  readonly provider: UserSSOProvider;

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
  @ValidateIf((obj) => obj.userId !== undefined && obj.userId !== null && obj.userId !== "")
  readonly userId?: string;

  @IsNotEmpty()
  @IsEnum(UserSSOProvider)
  @ValidateIf((obj) => obj.provider !== undefined && obj.provider !== null && obj.provider !== "")
  readonly provider?: UserSSOProvider;

  @IsNotEmpty()
  @IsString()
  @ValidateIf((obj) => obj.providerUserId !== undefined && obj.providerUserId !== null && obj.providerUserId !== "")
  readonly providerUserId?: string;

  @IsNotEmpty()
  @IsString()
  readonly email?: string;
}
