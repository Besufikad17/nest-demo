import { RefreshTokens, Prisma } from "@prisma/client";

export abstract class IRefreshTokenRepository {
  abstract createRefreshToken(createRefreshTokenArgs: Prisma.RefreshTokensCreateArgs): Promise<RefreshTokens>;
  abstract findRefreshToken(findRefreshTokenArg: Prisma.RefreshTokensFindFirstArgs): Promise<RefreshTokens | null>;
  abstract findRefreshTokens(findRefreshTokensArgs: Prisma.RefreshTokensFindManyArgs): Promise<RefreshTokens[]>;
  abstract deleteRefreshToken(deleteRefreshTokenArgs: Prisma.RefreshTokensDeleteArgs): Promise<any>;
}
