import { UserSSO, Prisma } from "generated/prisma/client";

export abstract class IUserSSORepository {
  abstract createUserSSO(createUserSSOArgs: Prisma.UserSSOCreateArgs): Promise<UserSSO>;
  abstract findUserSSO(findUserSSOArgs: Prisma.UserSSOFindFirstArgs): Promise<UserSSO | null>;
}
