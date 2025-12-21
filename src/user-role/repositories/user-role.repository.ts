import { Injectable } from "@nestjs/common";
import { IUserRoleRepository } from "../interfaces";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, UserRole } from "generated/prisma/client";

@Injectable()
export class UserRoleRepository implements IUserRoleRepository {
  constructor(private prisma: PrismaService) { }

  async createUserRole(createUserRoleArgs: Prisma.UserRoleCreateArgs): Promise<UserRole> {
    return await this.prisma.userRole.create(createUserRoleArgs);
  }

  async findUserRole(findUserRoleArgs: Prisma.UserRoleFindFirstArgs): Promise<UserRole | null> {
    return await this.prisma.userRole.findFirst(findUserRoleArgs);
  }

  async findUserRoles(findUserRolesArgs: Prisma.UserRoleFindManyArgs): Promise<UserRole[]> {
    return await this.prisma.userRole.findMany(findUserRolesArgs);
  }

  async updateUserRole(updateUserRoleArgs: Prisma.UserRoleUpdateArgs): Promise<UserRole> {
    return await this.prisma.userRole.update(updateUserRoleArgs);
  }

  async deleteUserRole(deleteUserRoleArgs: Prisma.UserRoleDeleteArgs): Promise<any> {
    return await this.prisma.userRole.delete(deleteUserRoleArgs);
  }
}
