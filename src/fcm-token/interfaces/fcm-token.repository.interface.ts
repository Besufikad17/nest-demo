import { FCMToken, Prisma } from "generated/prisma/client";

export abstract class IFCMTokenRepository {
  abstract createFCMToken(createFCMTokenArgs: Prisma.FCMTokenCreateArgs): Promise<FCMToken>;
  abstract findFCMToken(findFCMTokenArgs: Prisma.FCMTokenFindFirstArgs): Promise<FCMToken | null>;
  abstract findFCMTokens(findFCMTokensArgs: Prisma.FCMTokenFindManyArgs): Promise<FCMToken[]>;
  abstract updateFCMToken(updateFCMTokenArgs: Prisma.FCMTokenUpdateArgs): Promise<FCMToken>;
  abstract deleteFCMToken(deleteFCMTokenArgs: Prisma.FCMTokenDeleteArgs): Promise<any>;
}
