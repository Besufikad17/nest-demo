import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IUserActivityRepository, IUserActivityService } from '../interfaces';
import { UserActivityLog } from '@prisma/client';
import { AddUserActivityDto, FileUploadEventDto, FindUserActivityDto } from '../dto/user-activity.dto';
import { RoleEnums } from 'src/user-role/enums/role.enum';

@Injectable()
export class UserActivityService implements IUserActivityService {
  constructor(private userActivityRepository: IUserActivityRepository) { }

  async addUserActivity(addUserActivityDto: AddUserActivityDto): Promise<UserActivityLog> {
    try {
      return await this.userActivityRepository.addUserActivity({ data: addUserActivityDto });
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

  async findUserActivity(id: string, role: RoleEnums, userId?: string): Promise<UserActivityLog | null> {
    try {
      return await this.userActivityRepository.findUserActivity({
        where: {
          id: id,
          userId: role === RoleEnums.USER ? userId : undefined,
        },
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

  async findUserActivities(findUserActivityDto: FindUserActivityDto, userId?: string, skip?: number, take?: number): Promise<UserActivityLog[]> {
    try {
      const { sortOptions, ...findUserActivityWithoutSortOptions } = findUserActivityDto;

      return await this.userActivityRepository.findUserActivities({
        where: {
          userId: userId,
          ...findUserActivityWithoutSortOptions
        },
        orderBy: {
          ...sortOptions
        },
        skip: skip,
        take: take
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

  async onFileUploadEventListener(fileUploadEventDto: FileUploadEventDto): Promise<UserActivityLog> {
    try {
      return await this.addUserActivity({
        userId: fileUploadEventDto.userId,
        profileId: fileUploadEventDto.profileId,
        action: fileUploadEventDto.action,
        deviceInfo: fileUploadEventDto.deviceInfo,
        ipAddress: fileUploadEventDto.ip,
        actionTimestamp: new Date()
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
}
