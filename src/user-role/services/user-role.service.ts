import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IUserRoleRepository, IUserRoleService } from '../interfaces';
import { UserRole } from '@prisma/client';
import { AddUserRoleDto, GetUserRolesDto } from '../dto/user-role.dto';

@Injectable()
export class UserRoleService implements IUserRoleService {
  constructor(private userRoleRepository: IUserRoleRepository) { }

  async addUserRole(addUserRoleDto: AddUserRoleDto): Promise<UserRole> {
    try {
      return this.userRoleRepository.createUserRole({
        data: { ...addUserRoleDto }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else if (error.code === 'P2002') {
        throw new HttpException('User role already exists', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async getUserRoles(getUserRolesDto: GetUserRolesDto): Promise<UserRole[]> {
    try {
      return this.userRoleRepository.findUserRoles({
        where: { ...getUserRolesDto },
        include: {
          Role: true
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
