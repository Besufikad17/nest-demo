import { UserActivityLog } from "generated/prisma/client";
import { AddUserActivityDto, FileUploadEventDto, FindUserActivityDto } from "../dto/user-activity.dto";
import { USER_ACTIONS } from "generated/prisma/client";
import { RoleEnums } from "src/user-role/enums/role.enum";

export interface IFileUploadEvent {
  userId: string;
  profileId: string;
  action: USER_ACTIONS;
  deviceInfo: string;
  ip: string;
  actionTimestamp: Date;
}

export abstract class IUserActivityService {
  abstract addUserActivity(addUserActivityDto: AddUserActivityDto): Promise<UserActivityLog>;

  abstract findUserActivity(id: string, role: RoleEnums, userId?: string): Promise<UserActivityLog | null>;

  abstract findUserActivities(findUserActivityDto: FindUserActivityDto, userId?: string, skip?: number, take?: number): Promise<UserActivityLog[]>;

  abstract onFileUploadEventListener(fileUploadEventDto: FileUploadEventDto): Promise<UserActivityLog>;
}
