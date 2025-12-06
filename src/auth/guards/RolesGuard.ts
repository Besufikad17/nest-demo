import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { RoleEnums } from 'src/user-role/enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<RoleEnums[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Access denied: no user ID found');
    }

    const userRoles = await this.prisma.userRole.findMany({
      where: {
        userId: userId
      },
      include: {
        Role: true
      }
    });

    if (!userRoles || userRoles.length === 0) {
      throw new ForbiddenException('Access denied: user has no roles');
    }

    const userRoleNames = userRoles.map((userRole) => userRole.Role.roleName);

    if (!requiredRoles.some((role) => userRoleNames.includes(role.toString()))) {
      throw new ForbiddenException('Access denied: insufficient role');
    }

    return true;
  }
}
