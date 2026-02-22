import { User, UserAccountStatus } from "generated/prisma/client";
import { CreateUserDto, FindUserDto, FindUsersDto, UpdateUserDto } from "../dto/user.dto";
import { RoleEnums } from "src/user-role/enums/role.enum";

export interface IUserResponse {
  message: string;
  exists?: boolean;
}

export abstract class IUserService {
  abstract createUser(createUserDto: CreateUserDto): Promise<User>;
  abstract findUser(findUserDto: FindUserDto, role: RoleEnums, id?: string): Promise<User | null>;
  abstract findUsers(findUsersDto: FindUsersDto, text?: string, skip?: number, take?: number, status?: UserAccountStatus, active?: boolean): Promise<User[]>;
  abstract updateUser(updateUserDto: UpdateUserDto, userId: string, deviceInfo?: string, ip?: string): Promise<IUserResponse>;
  abstract deleteUser(id: string, deviceInfo: string, ip: string): Promise<IUserResponse>;
}
