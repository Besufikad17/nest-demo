import { SetMetadata } from '@nestjs/common';
import { RoleEnums } from 'src/user-role/enums/role.enum';

export const Roles = (...roles: RoleEnums[]): MethodDecorator =>
  SetMetadata('roles', roles);
