import { UserRole } from "generated/prisma/client";
import { AddUserRoleDto, GetUserRolesDto } from "../dto/user-role.dto";

export abstract class IUserRoleService {
  abstract addUserRole(addUserRoleDto: AddUserRoleDto): Promise<UserRole>;
  abstract getUserRoles(getUserRolesDto: GetUserRolesDto): Promise<UserRole[]>;
}
