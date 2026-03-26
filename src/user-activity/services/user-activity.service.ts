import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IUserActivityRepository, IUserActivityService } from "../interfaces";
import { UserActivityLog } from "generated/prisma/client"
import { AddUserActivityDto, FileUploadEventDto, FindUserActivityDto } from "../dto/user-activity.dto";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { IApiResponse } from "src/common/interfaces";

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
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async findUserActivity(id: string, role: RoleEnums, userId?: string): Promise<IApiResponse<UserActivityLog | null>> {
    try {
      const data = await this.userActivityRepository.findUserActivity({
        where: {
          id: id,
          userId: role === RoleEnums.USER ? userId : undefined,
        },
      });

      return {
        success: true,
        message: 'User activity log fetched.',
        data,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async findUserActivities(findUserActivityDto: FindUserActivityDto, userId?: string, skip?: number, take?: number): Promise<IApiResponse<UserActivityLog[]>> {
    try {
      const { sortOptions, ...findUserActivityWithoutSortOptions } = findUserActivityDto;

      const data = await this.userActivityRepository.findUserActivities({
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

      return {
        success: true,
        message: 'User activity logs fetched.',
        data,
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async onFileUploadEventListener(fileUploadEventDto: FileUploadEventDto): Promise<UserActivityLog> {
    try {
      return await this.addUserActivity({
        ...fileUploadEventDto,
        actionTimestamp: new Date()
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
