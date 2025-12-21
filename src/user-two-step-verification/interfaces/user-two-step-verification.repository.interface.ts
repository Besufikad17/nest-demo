import { UserTwoStepVerification, Prisma } from "generated/prisma/client";

export abstract class IUserTwoStepVerificationRepository {
  abstract createUserTwoStepVerification(
    createUserTwoStepVerificationArgs: Prisma.UserTwoStepVerificationCreateArgs
  ): Promise<UserTwoStepVerification>;

  abstract findUserTwoStepVerification(
    findUserTwoStepVerificationArgs: Prisma.UserTwoStepVerificationFindFirstArgs
  ): Promise<UserTwoStepVerification | null>;

  abstract findUserTwoStepVerifications(
    findUserTwoStepVerificationsArgs: Prisma.UserTwoStepVerificationFindManyArgs
  ): Promise<UserTwoStepVerification[]>;

  abstract updateUserTwoStepVerification(
    updateUserTwoStepVerificationArgs: Prisma.UserTwoStepVerificationUpdateArgs
  ): Promise<UserTwoStepVerification>;

  abstract deleteUserTwoStepVerification(
    deleteUserTwoStepVerificationArgs: Prisma.UserTwoStepVerificationDeleteArgs
  ): Promise<any>;
} 
