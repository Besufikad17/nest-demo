import { Injectable } from "@nestjs/common";
import { IUserTwoStepVerificationRepository } from "../interfaces/user-two-step-verification.repository.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { UserTwoStepVerification, Prisma } from "generated/prisma/client";

@Injectable()
export class UserTwoStepVerificationRepository implements IUserTwoStepVerificationRepository {
  constructor(private prisma: PrismaService) { }

  async createUserTwoStepVerification(createUserTwoStepVerificationArgs: Prisma.UserTwoStepVerificationCreateArgs): Promise<UserTwoStepVerification> {
    return await this.prisma.userTwoStepVerification.create(createUserTwoStepVerificationArgs);
  }

  async findUserTwoStepVerification(findUserTwoStepVerificationArgs: Prisma.UserTwoStepVerificationFindFirstArgs): Promise<UserTwoStepVerification | null> {
    return await this.prisma.userTwoStepVerification.findFirst(findUserTwoStepVerificationArgs);
  }

  async findUserTwoStepVerifications(findUserTwoStepVerificationsArgs: Prisma.UserTwoStepVerificationFindManyArgs): Promise<UserTwoStepVerification[]> {
    return await this.prisma.userTwoStepVerification.findMany(findUserTwoStepVerificationsArgs);
  }

  async updateUserTwoStepVerification(updateUserTwoStepVerificationArgs: Prisma.UserTwoStepVerificationUpdateArgs): Promise<UserTwoStepVerification> {
    return await this.prisma.userTwoStepVerification.update(updateUserTwoStepVerificationArgs);
  }

  async deleteUserTwoStepVerification(deleteUserTwoStepVerificationArgs: Prisma.UserTwoStepVerificationDeleteArgs): Promise<any> {
    return await this.prisma.userTwoStepVerification.delete(deleteUserTwoStepVerificationArgs);
  }
}
