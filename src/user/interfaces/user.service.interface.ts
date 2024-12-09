import { CreateUserDto, FindUserDto, UpdateUserDto } from "../dto/user.dto";
import { User } from "@prisma/client";

export abstract class IUserService {
  abstract createUser(createUserDto: CreateUserDto): Promise<User>;
  abstract findUser(findUserDto: FindUserDto): Promise<User | null>;
  abstract updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User>;
}
