import { ApiProperty } from "@nestjs/swagger";
import { ICreate2FAResponse, IVerify2FAResponse } from "../interfaces";
import { UserTwoFactorMethodType, UserTwoStepVerification } from "generated/prisma/browser";

export class Create2FAResponse implements ICreate2FAResponse {
  @ApiProperty()
  qrCode: string;
}

export class Verify2FAResponse implements IVerify2FAResponse {
  @ApiProperty()
  valid: boolean;
}

export class UserTwoStepVerificationResponse implements UserTwoStepVerification {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  methodType: UserTwoFactorMethodType;

  @ApiProperty()
  methodDetail: string;

  @ApiProperty()
  secret: string;

  @ApiProperty()
  isEnabled: boolean;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  addedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PublicKeyCredentialUserEntityJSONResponse implements PublicKeyCredentialUserEntityJSON {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  displayName: string;
}

export class PublicKeyCredentialRpEntityResponse implements PublicKeyCredentialRpEntity {
  @ApiProperty()
  name: string;

  @ApiProperty()
  id?: string;
}

export class PublicKeyCredentialParametersResponse implements PublicKeyCredentialParameters {
  @ApiProperty()
  type: "public-key";

  @ApiProperty()
  alg: number;
}


export class AuthenticatorSelectionCriteriaResponse implements AuthenticatorSelectionCriteria {
  @ApiProperty()
  residentKey?: ResidentKeyRequirement;

  @ApiProperty()
  userVerification?: UserVerificationRequirement;

  @ApiProperty()
  requireResidentKey?: boolean;

  @ApiProperty()
  authenticatorAttachment?: AuthenticatorAttachment;
}

export class AuthenticationExtensionsPRFInputsJSONResponse implements AuthenticationExtensionsPRFInputsJSON {
  @ApiProperty()
  eval?: AuthenticationExtensionsPRFValuesJSON;

  @ApiProperty()
  evalByCredential?: Record<string, AuthenticationExtensionsPRFValuesJSONResponse>;
}

export class AuthenticationExtensionsLargeBlobInputsJSONResponse implements AuthenticationExtensionsLargeBlobInputsJSON {
  @ApiProperty()
  read?: boolean;

  @ApiProperty()
  write?: string;

  @ApiProperty()
  support?: string;
}

export class AuthenticationExtensionsClientInputsJSONResponse implements AuthenticationExtensionsClientInputsJSON {
  @ApiProperty()
  prf?: AuthenticationExtensionsPRFInputsJSONResponse;

  @ApiProperty()
  appid?: string;

  @ApiProperty()
  credProps?: boolean;

  @ApiProperty()
  largeBlob?: AuthenticationExtensionsLargeBlobInputsJSONResponse;
}

export class PublicKeyCredentialCreationOptionsJSONResponse implements PublicKeyCredentialCreationOptionsJSON {
  @ApiProperty()
  extensions?: AuthenticationExtensionsClientInputsJSONResponse;

  @ApiProperty()
  challenge: string;

  @ApiProperty()
  timeout?: number;

  @ApiProperty()
  hints?: string[];

  @ApiProperty()
  user: PublicKeyCredentialUserEntityJSONResponse;

  @ApiProperty()
  rp: PublicKeyCredentialRpEntityResponse;

  @ApiProperty()
  attestation?: string;

  @ApiProperty()
  pubKeyCredParams: PublicKeyCredentialParametersResponse[];

  @ApiProperty()
  excludeCredentials?: PublicKeyCredentialDescriptorJSONResponse[];

  @ApiProperty()
  authenticatorSelection?: AuthenticatorSelectionCriteriaResponse;
}

export class AuthenticationExtensionsPRFValuesJSONResponse implements AuthenticationExtensionsPRFValuesJSON {
  @ApiProperty()
  first: string;

  @ApiProperty()
  second?: string;
}

export class PublicKeyCredentialDescriptorJSONResponse implements PublicKeyCredentialDescriptorJSON {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  transports?: string[];
}

export class PublicKeyCredentialRequestOptionsJSONResponse implements PublicKeyCredentialRequestOptionsJSON {
  @ApiProperty()
  rpId?: string;

  @ApiProperty()
  hints?: string[];

  @ApiProperty()
  timeout?: number;

  @ApiProperty()
  challenge: string;

  @ApiProperty()
  extensions?: AuthenticationExtensionsClientInputsJSONResponse;

  @ApiProperty()
  allowCredentials?: PublicKeyCredentialDescriptorJSONResponse[];
}
