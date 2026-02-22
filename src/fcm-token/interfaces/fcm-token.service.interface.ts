import { FCMToken } from "generated/prisma/client";
import { CreateFcmTokenDto } from "../dto/fcm-token.dto";

export interface IFCMTokenResponse {
  message: string;
}

export abstract class IFCMTokenService {
  abstract createFCMToken(registerFcmTokenDto: CreateFcmTokenDto): Promise<IFCMTokenResponse>;
  abstract getTokens(userId: string): Promise<FCMToken[]>;
}
