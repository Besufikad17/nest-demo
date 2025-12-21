import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/server";
import { UserTwoStepVerification } from "generated/prisma/client";
import {
  AddPasskeyDto,
  CreateUserTwoStepVerificationDto,
  GetPrimary2FaDto,
  UpdateUserTwoStepVerifcationDto,
  VerifyPasskeyDto,
  VerifyUserTwoStepVerificationDto
} from "../dto/user-two-step-verification.dto";

export interface I2FAResponse {
  message: string;
  qrCode?: string;
  valid?: boolean;
}

export abstract class IUserTwoStepVerificationService {
  abstract createUserTwoStepVerification(
    createUserTwoStepVerificationDto: CreateUserTwoStepVerificationDto,
    email: string,
    deviceInfo: string,
    ip: string
  ): Promise<I2FAResponse>;

  abstract finUserTwoStepVerification(userId: string): Promise<UserTwoStepVerification | null>;

  abstract getPrimary2Fa(getPrimary2FaDto: GetPrimary2FaDto): Promise<UserTwoStepVerification | null>;

  abstract finUserTwoStepVerifications(userId: string): Promise<UserTwoStepVerification[]>;

  abstract updateUserTwoStepVerification(
    updateUserTwoStepVerificationDto: UpdateUserTwoStepVerifcationDto,
    userId: string,
    deviceInfo: string,
    ip: string
  ): Promise<UserTwoStepVerification>;

  abstract verifyUserTwoStepVerification(
    verifyUserTwoStepVerification: VerifyUserTwoStepVerificationDto,
    userId: string,
    deviceInfo: string,
    ip: string
  ): Promise<I2FAResponse>;

  abstract deleteUserTwoStepVerification(id: string, userId: string, deviceInfo: string, ip: string): Promise<any>;

  abstract requestAddPasskey(userId: string, deviceInfo: string, ip: string): Promise<PublicKeyCredentialCreationOptionsJSON>;

  abstract addPasskey(addPasskeyDto: AddPasskeyDto, userId: string, deviceInfo: string, ip: string): Promise<I2FAResponse>;

  abstract requestVerifyPasskey(userId: string, deviceInfo: string, ip: string): Promise<PublicKeyCredentialRequestOptionsJSON>;

  abstract verifyPasskey(verifyPasskeyDto: VerifyPasskeyDto, userId: string, deviceInfo: string, ip: string): Promise<I2FAResponse>;
}
