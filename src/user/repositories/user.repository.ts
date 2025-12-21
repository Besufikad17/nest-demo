import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, User } from "generated/prisma/client"
import { IUserRepository } from "../interfaces";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) { }

  async createUser(createUserArgs: Prisma.UserCreateArgs): Promise<User> {
    return await this.prisma.user.create(createUserArgs);
  }

  async findUser(findUserArgs: Prisma.UserFindFirstArgs): Promise<User | null> {
    return await this.prisma.user.findFirst(findUserArgs);
  }

  async findUsers(findUsersArgs: Prisma.UserFindManyArgs): Promise<User[]> {
    return await this.prisma.user.findMany(findUsersArgs)
  }

  async updateUser(updateUserArgs: Prisma.UserUpdateArgs): Promise<User> {
    return await this.prisma.user.update(updateUserArgs);
  }

  async deleteUser(deleteUserArgs: Prisma.UserDeleteArgs): Promise<any> {
    return await this.prisma.user.delete(deleteUserArgs);
  }
}
