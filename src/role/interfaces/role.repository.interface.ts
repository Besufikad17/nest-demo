import { Prisma, Roles } from "generated/prisma/client";

export abstract class IRoleRepository {
  abstract createRole(createRoleArgs: Prisma.RolesCreateArgs): Promise<Roles>;
  abstract findRole(findRoleArgs: Prisma.RolesFindFirstArgs): Promise<Roles | null>;
  abstract findRoles(findRolesArgs: Prisma.RolesFindManyArgs): Promise<Roles[]>;
  abstract updateRole(updateRoleArgs: Prisma.RolesUpdateArgs): Promise<Roles>;
  abstract deleteRole(deleteRoleArgs: Prisma.RolesDeleteArgs): Promise<any>;
}
