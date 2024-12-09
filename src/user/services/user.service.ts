import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IUserRepository, IUserService } from '../interfaces';
import { User } from '@prisma/client';
import { CreateUserDto, FindUserDto, UpdateUserDto } from '../dto/user.dto';

@Injectable()
export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) { }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.userRepository.createUser(createUserDto);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else if (error.code === 'P2002') {
        throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async findUser(findUserDto: FindUserDto): Promise<User | null> {
    try {
      return await this.userRepository.findUser(findUserDto);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      return await this.userRepository.updateUser(userId, updateUserDto);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
