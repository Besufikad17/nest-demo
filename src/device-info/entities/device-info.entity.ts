import { ApiProperty } from "@nestjs/swagger";
import { DeviceInfo, DeviceType } from "generated/prisma/client";

export class GetSessionsResponse implements DeviceInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  browser: string;

  @ApiProperty()
  os: string;

  @ApiProperty()
  ipAddress: string;

  @ApiProperty()
  type: DeviceType;

  @ApiProperty()
  lastActiveAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
