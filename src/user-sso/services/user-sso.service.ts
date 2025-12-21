import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IUserSSORepository, IUserSSOService } from "../interfaces";
import { UserSSO } from "generated/prisma/client"
import { CreateUserSSODto, FindUserSSODto } from "../dto/user-sso.dto";

@Injectable()
export class UserSsoService implements IUserSSOService {
  constructor(private userSSORepository: IUserSSORepository) { }

  async createUserSSO(createUserSSODto: CreateUserSSODto): Promise<UserSSO> {
    try {
      return await this.userSSORepository.createUserSSO({ data: createUserSSODto });
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

  async findUserSSO(findUserSSODto: FindUserSSODto): Promise<UserSSO | null> {
    try {
      return await this.userSSORepository.findUserSSO({ where: findUserSSODto });
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
