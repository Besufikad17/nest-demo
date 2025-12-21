import { USER_PASSKEY_DEVICE_TYPE } from "generated/prisma/client";
import { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsUUID } from "class-validator";

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
  @IsEnum(USER_PASSKEY_DEVICE_TYPE)
  readonly deviceType: USER_PASSKEY_DEVICE_TYPE;

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
