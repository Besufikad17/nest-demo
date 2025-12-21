import { Prisma, UserActivityLog } from "generated/prisma/client";
import { IUserActivityRepository } from "../interfaces";
import { PrismaService } from "src/prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class UserActivityRepository implements IUserActivityRepository {
  constructor(private prisma: PrismaService) { }

  async addUserActivity(addUserActivityArgs: Prisma.UserActivityLogCreateArgs): Promise<UserActivityLog> {
    return await this.prisma.userActivityLog.create(addUserActivityArgs);
  }

  async findUserActivity(findUserActivityArgs: Prisma.UserActivityLogFindFirstArgs): Promise<UserActivityLog | null> {
    return await this.prisma.userActivityLog.findFirst(findUserActivityArgs);
  }

  async findUserActivities(findUserActivityArgs: Prisma.UserActivityLogFindManyArgs): Promise<UserActivityLog[]> {
    return await this.prisma.userActivityLog.findMany(findUserActivityArgs);
  }
}
