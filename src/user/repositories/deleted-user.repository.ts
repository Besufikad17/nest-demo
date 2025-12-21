import { Injectable } from "@nestjs/common";
import { IDeletedUserRepository } from "../interfaces/deleted-user.repository.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, DeletedUser } from "generated/prisma/client";

@Injectable()
export class DeletedUserRepository implements IDeletedUserRepository {
  constructor(private prisma: PrismaService) { }

  async createDeletedUser(createDeletedUserArgs: Prisma.DeletedUserCreateArgs): Promise<DeletedUser> {
    return await this.prisma.deletedUser.create(createDeletedUserArgs);
  }

  async findDeletedUser(findDeletedUsersArgs: Prisma.DeletedUserFindFirstArgs): Promise<DeletedUser | null> {
    return await this.prisma.deletedUser.findFirst(findDeletedUsersArgs);
  }

  async findDeletedUsers(findDeletedUserArgs: Prisma.DeletedUserFindManyArgs): Promise<DeletedUser[]> {
    return await this.prisma.deletedUser.findMany(findDeletedUserArgs);
  }

  async updateDeletedUser(updateDeletedUserArgs: Prisma.DeletedUserUpdateArgs): Promise<DeletedUser> {
    return await this.prisma.deletedUser.update(updateDeletedUserArgs);
  }

  async deleteDeletedUser(deletedDeletedUserArgs: Prisma.DeletedUserDeleteArgs): Promise<any> {
    return await this.prisma.deletedUser.delete(deletedDeletedUserArgs);
  }
}
