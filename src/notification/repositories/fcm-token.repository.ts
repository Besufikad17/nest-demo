import { Injectable } from "@nestjs/common";
import { IFcmTokenRepository } from "../interfaces/fcm-token.repository.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, FCMToken } from "generated/prisma/client";

@Injectable()
export class FcmTokenRepository implements IFcmTokenRepository {
  constructor(private prisma: PrismaService) { }

  async createFcmToken(createFcmTokenArgs: Prisma.FCMTokenCreateArgs): Promise<FCMToken> {
    return await this.prisma.fCMToken.create(createFcmTokenArgs);
  }

  async findFcmToken(findFcmTokenArgs: Prisma.FCMTokenFindFirstArgs): Promise<FCMToken | null> {
    return await this.prisma.fCMToken.findFirst(findFcmTokenArgs);
  }

  async findFcmTokens(findFcmTokensArgs: Prisma.FCMTokenFindManyArgs): Promise<FCMToken[]> {
    return await this.prisma.fCMToken.findMany(findFcmTokensArgs);
  }

  async updateFcmToken(updateFcmTokenArgs: Prisma.FCMTokenUpdateArgs): Promise<FCMToken> {
    return await this.prisma.fCMToken.update(updateFcmTokenArgs);
  }

  async deleteFcmToken(deleteFcmTokenArgs: Prisma.FCMTokenDeleteArgs): Promise<any> {
    return await this.prisma.fCMToken.delete(deleteFcmTokenArgs);
  }
}
