import { Injectable } from "@nestjs/common";
import { IFCMTokenRepository } from "../interfaces/fcm-token.repository.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, FCMToken } from "generated/prisma/client";

@Injectable()
export class FCMTokenRepository implements IFCMTokenRepository {
  constructor(private prisma: PrismaService) { }

  async createFCMToken(createFcmTokenArgs: Prisma.FCMTokenCreateArgs): Promise<FCMToken> {
    return await this.prisma.fCMToken.create(createFcmTokenArgs);
  }

  async findFCMToken(findFcmTokenArgs: Prisma.FCMTokenFindFirstArgs): Promise<FCMToken | null> {
    return await this.prisma.fCMToken.findFirst(findFcmTokenArgs);
  }

  async findFCMTokens(findFcmTokensArgs: Prisma.FCMTokenFindManyArgs): Promise<FCMToken[]> {
    return await this.prisma.fCMToken.findMany(findFcmTokensArgs);
  }

  async updateFCMToken(updateFcmTokenArgs: Prisma.FCMTokenUpdateArgs): Promise<FCMToken> {
    return await this.prisma.fCMToken.update(updateFcmTokenArgs);
  }

  async deleteFCMToken(deleteFcmTokenArgs: Prisma.FCMTokenDeleteArgs): Promise<any> {
    return await this.prisma.fCMToken.delete(deleteFcmTokenArgs);
  }
}
