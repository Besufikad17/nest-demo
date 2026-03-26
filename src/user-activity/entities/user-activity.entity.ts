import { ApiProperty } from "@nestjs/swagger";
import { UserActions, UserActivityLog } from "generated/prisma/browser";

export class UserActivityLogResponse implements UserActivityLog {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  deviceId: string;

  @ApiProperty()
  action: UserActions;

  @ApiProperty()
  actionTimestamp: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
