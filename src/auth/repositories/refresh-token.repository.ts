import { Injectable } from "@nestjs/common";
import { IRefreshTokenRepository } from "../interfaces/refresh-token.repository.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { RefreshTokens, Prisma } from "generated/client";

@Injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  constructor(private prisma: PrismaService) { }

  async createRefreshToken(createRefreshTokenArgs: Prisma.RefreshTokensCreateArgs): Promise<RefreshTokens> {
    return await this.prisma.refreshTokens.create(createRefreshTokenArgs);
  }

  async findRefreshToken(findRefreshTokenArgs: Prisma.RefreshTokensFindFirstArgs): Promise<RefreshTokens | null> {
    return await this.prisma.refreshTokens.findFirst(findRefreshTokenArgs);
  }

  async findRefreshTokens(findRefreshTokensArgs: Prisma.RefreshTokensFindManyArgs): Promise<RefreshTokens[]> {
    return await this.prisma.refreshTokens.findMany(findRefreshTokensArgs);
  }

  async deleteRefreshToken(deleteRefreshTokenArgs: Prisma.RefreshTokensDeleteArgs): Promise<any> {
    return await this.prisma.refreshTokens.delete(deleteRefreshTokenArgs);
  }
}
