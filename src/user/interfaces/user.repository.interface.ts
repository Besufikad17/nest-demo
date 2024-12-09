import { User } from "@prisma/client";
import { CreateUserDto, FindUserDto, UpdateUserDto } from "../dto/user.dto";

export abstract class IUserRepository {
  abstract createUser(createUserDto: CreateUserDto): Promise<User>;
  abstract findUser(findUserDto: FindUserDto): Promise<User | null>;
  abstract updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
}
