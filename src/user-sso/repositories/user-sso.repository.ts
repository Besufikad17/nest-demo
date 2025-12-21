import { Injectable } from "@nestjs/common";
import { IUserSSORepository } from "../interfaces";
import { PrismaService } from "src/prisma/prisma.service";
import { UserSSO, Prisma } from "generated/prisma/client";

@Injectable()
export class UserSSORepository implements IUserSSORepository {
  constructor(private prisma: PrismaService) { }

  async createUserSSO(createUserSSOArgs: Prisma.UserSSOCreateArgs): Promise<UserSSO> {
    return await this.prisma.userSSO.create(createUserSSOArgs);
  }

  async findUserSSO(findUserSSOArgs: Prisma.UserSSOFindFirstArgs): Promise<UserSSO | null> {
    return await this.prisma.userSSO.findFirst(findUserSSOArgs);
  }
}
