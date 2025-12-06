import { Controller } from '@nestjs/common';
import { IUserRoleService } from '../interfaces';
import { MessagePattern } from '@nestjs/microservices';
import { IRoleService } from 'src/role/interfaces';

@Controller('user-role')
export class UserRoleController {
  constructor(
    private roleService: IRoleService,
    private userRoleService: IUserRoleService
  ) { }

  @MessagePattern({ cmd: 'getUserRoles' })
  async getUserRoles(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleService.getUserRoles({ userId: userId });

    const rolesPromise = userRoles.map(async (userRole) => {
      return await this.roleService.getRole({ id: userRole.roleId });
    });

    const roles = await Promise.all(rolesPromise);

    return roles.map(role => role?.roleName || "");
  }
}
