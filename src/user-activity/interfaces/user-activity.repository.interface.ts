import { Prisma, UserActivityLog } from "generated/prisma/client";

export abstract class IUserActivityRepository {
  abstract addUserActivity(addUserActivityArgs: Prisma.UserActivityLogCreateArgs): Promise<UserActivityLog>;

  abstract findUserActivity(findUserActivityArgs: Prisma.UserActivityLogFindFirstArgs): Promise<UserActivityLog | null>;

  abstract findUserActivities(findUserActivityArgs: Prisma.UserActivityLogFindManyArgs): Promise<UserActivityLog[]>;
}
