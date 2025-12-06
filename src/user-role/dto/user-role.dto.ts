import { IsNotEmpty, IsUUID } from "class-validator";

export class AddUserRoleDto {
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;

  @IsNotEmpty()
  @IsUUID()
  readonly roleId: string;
}

export class GetUserRolesDto {
  @IsNotEmpty()
  @IsUUID()
  readonly userId: string;
}
