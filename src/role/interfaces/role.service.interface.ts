import { Roles } from "generated/prisma/client";
import { AddRoleDto, GetRoleDto } from "../dto/role.dto";

export abstract class IRoleService {
  abstract addRole(addRoleDto: AddRoleDto): Promise<Roles>;
  abstract getRole(getRoleDto: GetRoleDto): Promise<Roles | null>;
}
