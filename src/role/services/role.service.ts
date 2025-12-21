import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IRoleRepository, IRoleService } from "../interfaces";
import { Roles } from "generated/prisma/client"
import { AddRoleDto, GetRoleDto } from "../dto/role.dto";

@Injectable()
export class RoleService implements IRoleService {
  constructor(private roleRepository: IRoleRepository) { }

  async addRole(addRoleDto: AddRoleDto): Promise<Roles> {
    try {
      return await this.roleRepository.createRole({
        data: { ...addRoleDto }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async getRole(getRoleDto: GetRoleDto): Promise<Roles | null> {
    try {
      return await this.roleRepository.findRole({
        where: {
          ...getRoleDto
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
