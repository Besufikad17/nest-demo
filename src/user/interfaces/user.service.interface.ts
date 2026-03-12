import { User, UserAccountStatus } from "generated/prisma/client";
import { CreateUserDto, FindUserDto, FindUsersDto, UpdateUserDto } from "../dto/user.dto";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";

export interface IUserResponse {
  exists?: boolean;
}

export abstract class IUserService {
  abstract createUser(createUserDto: CreateUserDto): Promise<User>;
  abstract findUser(findUserDto: FindUserDto, role: RoleEnums, exposeSecrets: boolean, id?: string): Promise<IApiResponse<User | null>>;
  abstract findUsers(findUsersDto: FindUsersDto, text?: string, skip?: number, take?: number, status?: UserAccountStatus, active?: boolean): Promise<IApiResponse<User[]>>;
  abstract updateUser(updateUserDto: UpdateUserDto, userId: string, deviceInfo?: IDeviceInfo, ip?: string): Promise<IApiResponse<null>>;
  abstract updateAccount(updateUserDto: UpdateUserDto, userId: string, deviceInfo?: IDeviceInfo, ip?: string): Promise<IApiResponse<null>>;
  abstract deleteUser(id: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<null>>;
}
