import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IDeletedUserRepository, IUserRepository, IUserService } from "../interfaces";
import { User, UserAccountStatus } from "generated/prisma/client"
import { CreateUserDto, FindUserDto, FindUsersDto, UpdateUserDto } from "../dto/user.dto";
import { IUserActivityService } from "src/user-activity/interfaces";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { IOtpService } from "src/otp/interfaces";
import { addMinutes } from "src/common/utils/date.utils";
import { IDeviceInfoService } from "src/device-info/interfaces";
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";
import { addOrGetDeviceId } from "src/common/helpers/device-id.helper";
import { ErrorCode } from "src/common/enums";

@Injectable()
export class UserService implements IUserService {
  constructor(
    private deletedUserRepository: IDeletedUserRepository,
    private deviceInfoService: IDeviceInfoService,
    private otpService: IOtpService,
    private userActivityService: IUserActivityService,
    private userRepository: IUserRepository,
  ) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userRepository.createUser({
        data: {
          ...createUserDto
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else if (error.code === "P2002") {
        throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findUser(findUserDto: FindUserDto, role: RoleEnums, exposeSecrets: boolean, id?: string): Promise<IApiResponse<User | null>> {
    try {
      const isSelfLookup = !!id && !!findUserDto.id && id === findUserDto.id;
      const allowSensitiveFields = role === RoleEnums.ADMIN || isSelfLookup || !id;

      const data = await this.userRepository.findUser({
        where: {
          OR: [
            { id: findUserDto.id },
            { email: findUserDto.email },
            { phoneNumber: findUserDto.phoneNumber }
          ]
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          isActive: true,
          accountStatus: true,
          lastLogin: true,
          twoStepEnabled: allowSensitiveFields,
          ...(exposeSecrets ? { passwordHash: allowSensitiveFields } : {}),
          userTwoStepVerifications: allowSensitiveFields ? {
            omit: {
              secret: true
            }
          } : false
        }
      });

      return {
        success: true,
        message: "User fetched successfully",
        data,
        error: null
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        }
      } else {
        return {
          success: false,
          message: "Error occurred check the log in the server",
          data: null,
          error: ErrorCode.GENERAL_ERROR,
        };
      }
    }
  }

  async findUsers(findUsersDto: FindUsersDto, text?: string, skip?: number, take?: number, status?: UserAccountStatus, active?: boolean): Promise<IApiResponse<User[]>> {
    try {
      const where: any = {};

      if (text) {
        where.OR = [
          { email: { contains: text, mode: "insensitive" } },
          { phoneNumber: { contains: text, mode: "insensitive" } },
          { firstName: { contains: text, mode: "insensitive" } },
          { lastName: { contains: text, mode: "insensitive" } }
        ];
      }

      if (status !== undefined) {
        where.accountStatus = status;
      }

      if (active !== undefined) {
        where.isActive = active;
      }

      const data = await this.userRepository.findUsers({
        where,
        skip,
        take,
        orderBy: {
          ...findUsersDto.sortOptions
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          isActive: true,
          accountStatus: true,
          lastLogin: true,
        }
      }); return {
        success: true,
        message: "Users fetched successfully",
        data,
        error: null
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        }
      } else {
        return {
          success: false,
          message: "Error occurred check the log in the server",
          data: null,
          error: ErrorCode.GENERAL_ERROR,
        };
      }
    }
  }

  async updateAccount(updateUserDto: UpdateUserDto, userId: string, deviceInfo?: IDeviceInfo, ip?: string): Promise<IApiResponse<null>> {
    try {
      let otp = await this.otpService.getOTP({ userId: userId, type: "TWO_FACTOR_AUTHENTICATION" });

      if (!otp) {
        const user = await this.userRepository.findUser({ where: { id: userId } });
        if (user) {
          if (user.email) {
            otp = await this.otpService.getOTP({ value: user.email, type: "TWO_FACTOR_AUTHENTICATION" });
          }
          if (!otp && user.phoneNumber) {
            otp = await this.otpService.getOTP({ value: user.phoneNumber, type: "TWO_FACTOR_AUTHENTICATION" });
          }
        }
      }

      if ((otp && (otp.status !== "VERIFIED" || otp.updatedAt < addMinutes(new Date(), -3))) || !otp) {
        throw new HttpException("Please verify your action first!!", HttpStatus.BAD_REQUEST);
      }

      return await this.updateUser(updateUserDto, userId, deviceInfo, ip);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        }
      } else {
        return {
          success: false,
          message: "Error occurred check the log in the server",
          data: null,
          error: ErrorCode.GENERAL_ERROR,
        };
      }
    }
  }

  async updateUser(updateUserDto: UpdateUserDto, userId: string, deviceInfo?: IDeviceInfo, ip?: string): Promise<IApiResponse<null>> {
    try {
      await this.userRepository.updateUser({
        where: {
          id: userId
        },
        data: updateUserDto,
      });

      let deviceId = null;
      if (deviceInfo) {
        deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      }

      await this.userActivityService.addUserActivity({
        userId: userId,
        action: "UPDATE_USER",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        success: true,
        message: "User updated successfully"
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        }
      } else {
        return {
          success: false,
          message: "Error occurred check the log in the server",
          data: null,
          error: ErrorCode.GENERAL_ERROR,
        };
      }
    }
  }

  async deleteUser(id: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<null>> {
    try {
      const otp = await this.otpService.getOTP({ userId: id, type: "TWO_FACTOR_AUTHENTICATION" });

      if ((otp && (otp.status !== "VERIFIED" || otp.updatedAt < addMinutes(new Date(), -3))) || !otp) {
        throw new HttpException("Please verify your action first!!", HttpStatus.BAD_REQUEST);
      }

      const user = await this.userRepository.findUser({
        where: {
          id: id
        },
        include: {
          userSSOs: true,
          userActivityLogs: true,
          userTwoStepVerifications: true,
          otp: true,
          userRoles: {
            include: {
              role: true
            }
          },
          webAuthnCredentials: true,
          notificationSettings: true
        }
      });

      if (!user) throw new HttpException("User not found!!", HttpStatus.BAD_REQUEST);

      await this.deletedUserRepository.createDeletedUser({
        data: {
          userId: id,
          data: JSON.stringify(user)
        }
      });

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, id, ip);
      await this.userActivityService.addUserActivity({
        userId: id,
        action: "DELETE_ACCOUNT",
        actionTimestamp: new Date(),
        deviceId
      });

      await this.userRepository.deleteUser({
        where: {
          id: id
        }
      });

      return {
        success: true,
        message: "User accout deleted successfully"
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        }
      } else {
        return {
          success: false,
          message: "Error occurred check the log in the server",
          data: null,
          error: ErrorCode.GENERAL_ERROR,
        };
      }
    }
  }
}
