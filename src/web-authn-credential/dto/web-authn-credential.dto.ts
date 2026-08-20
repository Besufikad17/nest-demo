import { UserPasskeyDeviceType } from "generated/prisma/client";
import { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from "class-validator";

export class CreateWebAuthnCredentialDto {
  @IsNotEmpty()
  readonly credentialId: Buffer;

  @IsNotEmpty()
  readonly publicKey: Buffer;

  @IsNotEmpty()
  @IsNumber()
  readonly counter: number;

  @IsNotEmpty()
  @IsUUID()
  readonly userId?: string;

  @IsNotEmpty()
  readonly transports: AuthenticatorTransportFuture[] | string;

  @IsNotEmpty()
  @IsEnum(UserPasskeyDeviceType)
  readonly deviceType: UserPasskeyDeviceType;

  @IsNotEmpty()
  @IsBoolean()
  readonly backedUp: boolean;
}

export class FindWebAuthnCredentialDto {
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;

  @IsNotEmpty()
  readonly credentialId: Buffer;
}

export class UpdateWebAuthnCredentialDto {
  @IsOptional()
  @IsNumber()
  readonly counter?: number;
}
