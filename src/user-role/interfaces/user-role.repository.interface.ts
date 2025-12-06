import { Prisma, UserRole } from "@prisma/client";

export abstract class IUserRoleRepository {
  abstract createUserRole(createUserRoleArgs: Prisma.UserRoleCreateArgs): Promise<UserRole>;
  abstract findUserRole(findUserRoleArgs: Prisma.UserRoleFindFirstArgs): Promise<UserRole | null>;
  abstract findUserRoles(findUserRolesArgs: Prisma.UserRoleFindManyArgs): Promise<UserRole[]>;
  abstract updateUserRole(updateUserRoleArgs: Prisma.UserRoleUpdateArgs): Promise<UserRole>;
  abstract deleteUserRole(deleteUserRoleArgs: Prisma.UserRoleDeleteArgs): Promise<any>;
}
