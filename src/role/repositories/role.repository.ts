import { Injectable } from "@nestjs/common";
import { IRoleRepository } from "../interfaces";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, Roles } from "generated/prisma/client";

@Injectable()
export class RoleRepository implements IRoleRepository {
  constructor(private prisma: PrismaService) { }

  async createRole(createRoleArgs: Prisma.RolesCreateArgs): Promise<Roles> {
    return this.prisma.roles.create(createRoleArgs);
  }

  async findRole(findRoleArgs: Prisma.RolesFindFirstArgs): Promise<Roles | null> {
    return this.prisma.roles.findFirst(findRoleArgs);
  }

  async findRoles(findRolesArgs: Prisma.RolesFindManyArgs): Promise<Roles[]> {
    return this.prisma.roles.findMany(findRolesArgs);
  }

  async updateRole(updateRoleArgs: Prisma.RolesUpdateArgs): Promise<Roles> {
    return this.prisma.roles.update(updateRoleArgs);
  }

  async deleteRole(deleteRoleArgs: Prisma.RolesDeleteArgs): Promise<any> {
    return this.prisma.roles.delete(deleteRoleArgs);
  }
}
