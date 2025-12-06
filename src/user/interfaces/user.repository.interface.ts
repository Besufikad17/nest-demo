import { Prisma, User } from '@prisma/client';

export abstract class IUserRepository {
  abstract createUser(createUserArgs: Prisma.UserCreateArgs): Promise<User>;
  abstract findUser(findFirstUserArgs: Prisma.UserFindFirstArgs): Promise<User | null>;
  abstract findUsers(findUsersArgs: Prisma.UserFindManyArgs): Promise<User[]>;
  abstract updateUser(updateUserArgs: Prisma.UserUpdateArgs): Promise<User>;
  abstract deleteUser(deleteUserArgs: Prisma.UserDeleteArgs): Promise<any>;
}
