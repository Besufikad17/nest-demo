import { DeletedUser, Prisma } from "generated/prisma/client";

export abstract class IDeletedUserRepository {
  abstract createDeletedUser(createDeletedUserArgs: Prisma.DeletedUserCreateArgs): Promise<DeletedUser>;
  abstract findDeletedUsers(findDeletedUserArgs: Prisma.DeletedUserFindManyArgs): Promise<DeletedUser[]>;
  abstract findDeletedUser(findDeletedUsersArgs: Prisma.DeletedUserFindFirstArgs): Promise<DeletedUser | null>;
  abstract updateDeletedUser(updateDeletedUserArgs: Prisma.DeletedUserUpdateArgs): Promise<DeletedUser>;
  abstract deleteDeletedUser(deletedDeletedUserArgs: Prisma.DeletedUserDeleteArgs): Promise<any>;
}
