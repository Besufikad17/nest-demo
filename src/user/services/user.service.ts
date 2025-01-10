import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IDeletedUserRepository, IUserRepository, IUserResponse, IUserService } from '../interfaces';
import { User, USER_ACCOUNT_STATUS } from '@prisma/client';
import { CreateUserDto, FindUserDto, FindUsersDto, UpdateUserDto } from '../dto/user.dto';
import { IUserActivityService } from 'src/user-activity/interfaces';
import { RoleEnums } from 'src/user-role/enums/role.enum';

@Injectable()
export class UserService implements IUserService {
  constructor(
    private deletedUserRepository: IDeletedUserRepository,
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
      } else if (error.code === 'P2002') {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findUser(findUserDto: FindUserDto, role: RoleEnums, id: string): Promise<User | null> {
    try {
      return await this.userRepository.findUser({
        where: {
          OR: [
            { id: findUserDto.id },
            { email: findUserDto.email },
            { phoneNumber: findUserDto.phoneNumber }
          ]
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          isActive: true,
          accountStatus: true,
          lastLogin: true,
          twoStepEnabled: role === RoleEnums.ADMIN || id === findUserDto.id,
          passwordHash: id === findUserDto.id,
          UserTwoStepVerifications: role === RoleEnums.ADMIN || id === findUserDto.id
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async findUsers(findUsersDto: FindUsersDto, text?: string, skip?: number, take?: number, status?: USER_ACCOUNT_STATUS, active?: boolean): Promise<User[]> {
    try {
      return await this.userRepository.findUsers({
        where: {
          OR: [
            { email: { contains: text, mode: 'insensitive' } },
            { phoneNumber: { contains: text, mode: 'insensitive' } },
            { firstName: { contains: text, mode: 'insensitive' } },
            { lastName: { contains: text, mode: 'insensitive' } }
          ],
          accountStatus: status,
          isActive: active
        },
        skip: skip,
        take: take,
        orderBy: {
          ...findUsersDto.sortOptions
        },
        select: {
          id: true,
          email: true,
          phoneNumber: true,
          isActive: true,
          accountStatus: true,
          lastLogin: true,
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async updateUser(updateUserDto: UpdateUserDto, userId: string): Promise<User> {
    try {
      return await this.userRepository.updateUser({
        where: {
          id: userId
        },
        data: updateUserDto
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async deleteUser(id: string, deviceInfo: string, ip: string): Promise<IUserResponse> {
    try {
      const user = await this.userRepository.findUser({
        where: {
          id: id
        },
        include: {
          UserSSO: true,
          UserActivityLogs: true,
          UserTwoStepVerifications: true,
          OTP: true,
          UserRole: {
            include: {
              Role: true
            }
          },
          WebAuthnCredential: true,
          NotificationSettings: true
        }
      });

      if (!user) throw new HttpException("User not found!!", HttpStatus.BAD_REQUEST);

      await this.deletedUserRepository.createDeletedUser({
        data: {
          userId: id,
          data: JSON.stringify(user)
        }
      });

      await this.userActivityService.addUserActivity({
        userId: id,
        action: "DELETE_ACCOUNT",
        deviceInfo: deviceInfo,
        ipAddress: ip,
        actionTimestamp: new Date()
      });

      await this.userRepository.deleteUser({
        where: {
          id: id
        }
      });

      return {
        message: "User accout deleted successfully"
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
