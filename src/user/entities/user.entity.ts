import { ApiProperty } from "@nestjs/swagger";
import { UserAccountStatus, UserTwoFactorMethodType } from "generated/prisma/enums";
import { UserTwoStepVerification } from "generated/prisma/client";

export class UserTwoStepVerificationResponse implements Omit<UserTwoStepVerification, "secret"> {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  isEnabled: boolean;

  @ApiProperty()
  isPrimary: boolean;

  @ApiProperty()
  methodType: UserTwoFactorMethodType;

  @ApiProperty()
  methodDetail: string;

  @ApiProperty()
  addedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FindUsersResponse {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  accountStatus: UserAccountStatus;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  lastLogin: Date;

  @ApiProperty()
  updatedAt: boolean;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class FindUserResponse extends FindUsersResponse {
  @ApiProperty()
  twoStepEnabled: boolean;

  @ApiProperty({ type: [UserTwoStepVerificationResponse] })
  userTwoStepVerifications: UserTwoStepVerificationResponse[];
}
