import { IsNotEmpty, IsString, IsUUID, ValidateIf } from "class-validator";

export class AddRoleDto {
  @IsNotEmpty()
  @IsString()
  readonly roleName: string;

  @IsNotEmpty()
  @IsString()
  readonly description: string;
}

export class GetRoleDto {
  @IsUUID()
  @ValidateIf((obj) => obj.id !== undefined && obj.id !== null && obj.id !== '')
  readonly id?: string;

  @IsString()
  @ValidateIf((obj) => obj.roleName !== undefined && obj.roleName !== null && obj.roleName !== '')
  readonly roleName?: string;
}

