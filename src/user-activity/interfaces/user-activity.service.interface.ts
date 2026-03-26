import { UserActivityLog } from "generated/prisma/client";
import { AddUserActivityDto, FileUploadEventDto, FindUserActivityDto } from "../dto/user-activity.dto";
import { UserActions } from "generated/prisma/client";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { IApiResponse } from "src/common/interfaces";

export interface IFileUploadEvent {
  userId: string;
  profileId: string;
  action: UserActions;
  deviceInfo: string;
  ip: string;
  actionTimestamp: Date;
}

export abstract class IUserActivityService {
  abstract addUserActivity(addUserActivityDto: AddUserActivityDto): Promise<UserActivityLog>;

  abstract findUserActivity(id: string, role: RoleEnums, userId?: string): Promise<IApiResponse<UserActivityLog | null>>;

  abstract findUserActivities(findUserActivityDto: FindUserActivityDto, userId?: string, skip?: number, take?: number): Promise<IApiResponse<UserActivityLog[]>>;

  abstract onFileUploadEventListener(fileUploadEventDto: FileUploadEventDto): Promise<UserActivityLog>;
}
