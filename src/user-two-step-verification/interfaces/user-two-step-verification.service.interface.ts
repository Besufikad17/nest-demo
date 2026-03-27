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
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";

export interface ICreate2FAResponse {
  qrCode: string;
}

export interface IVerify2FAResponse {
  valid: boolean;
}

export abstract class IUserTwoStepVerificationService {
  abstract createUserTwoStepVerification(
    createUserTwoStepVerificationDto: CreateUserTwoStepVerificationDto,
    userId: string,
    email: string,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<ICreate2FAResponse>>;

  abstract finUserTwoStepVerification(userId: string): Promise<UserTwoStepVerification | null>;

  abstract getPrimary2Fa(getPrimary2FaDto: GetPrimary2FaDto): Promise<IApiResponse<UserTwoStepVerification | null>>;

  abstract finUserTwoStepVerifications(userId: string): Promise<IApiResponse<UserTwoStepVerification[]>>;

  abstract updateUserTwoStepVerification(
    updateUserTwoStepVerificationDto: UpdateUserTwoStepVerifcationDto,
    userId: string,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<UserTwoStepVerification>>;

  abstract verifyUserTwoStepVerification(
    verifyUserTwoStepVerification: VerifyUserTwoStepVerificationDto,
    userId: string,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<IVerify2FAResponse>>;

  abstract deleteUserTwoStepVerification(id: string, userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<any>>;

  abstract requestAddPasskey(userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<PublicKeyCredentialCreationOptionsJSON>>;

  abstract addPasskey(addPasskeyDto: AddPasskeyDto, userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<null>>;

  abstract requestVerifyPasskey(userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<PublicKeyCredentialRequestOptionsJSON>>;

  abstract verifyPasskey(verifyPasskeyDto: VerifyPasskeyDto, userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<IVerify2FAResponse>>;
}
