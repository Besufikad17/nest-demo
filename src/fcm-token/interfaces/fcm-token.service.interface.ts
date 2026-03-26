import { FCMToken } from "generated/prisma/client";
import { CreateFcmTokenDto } from "../dto/fcm-token.dto";
import { IApiResponse } from "src/common/interfaces";

export interface IFCMTokenResponse {
  message: string;
}

export abstract class IFCMTokenService {
  abstract createFCMToken(registerFcmTokenDto: CreateFcmTokenDto): Promise<IApiResponse<IFCMTokenResponse>>;
  abstract getTokens(userId: string): Promise<FCMToken[]>;
}
