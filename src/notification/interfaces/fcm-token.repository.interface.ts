import { FCMToken, Prisma } from "generated/prisma/client";

export abstract class IFcmTokenRepository {
  abstract createFcmToken(createFcmTokenArgs: Prisma.FCMTokenCreateArgs): Promise<FCMToken>;
  abstract findFcmToken(findFcmTokenArgs: Prisma.FCMTokenFindFirstArgs): Promise<FCMToken | null>;
  abstract findFcmTokens(findFcmTokensArgs: Prisma.FCMTokenFindManyArgs): Promise<FCMToken[]>;
  abstract updateFcmToken(updateFcmTokenArgs: Prisma.FCMTokenUpdateArgs): Promise<FCMToken>;
  abstract deleteFcmToken(deleteFcmTokenArgs: Prisma.FCMTokenDeleteArgs): Promise<any>;
}
