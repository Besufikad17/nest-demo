import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/utils/types';
import * as bcrypt from 'bcryptjs';


@Controller('api/user')
export class UserController {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService
    ) {}

  @Post('/signup')
  async signup( @Body() userData: { username: string; email: string; password: string }): Promise<any> {
    console.log(userData);
    const { username, email, password } = userData;
    if (!username || !email || !password) {
      throw new HttpException(
        'Please enter all fields!!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    let salt: string = await bcrypt.genSalt(10);
    let pwd: string = await bcrypt.hash(password, salt);

    try {
      const n = await this.prismaService.user.count({
        where: {
          username,
        },
      });

      const exists = n > 0 ? true : false;
      if (exists) {
        throw new HttpException(
          'User already exists with this username!!',
          HttpStatus.NOT_ACCEPTABLE,
        );
      } else {
        const newUser = await this.prismaService.user.create({
          data: {
            username,
            email,
            password: pwd,
          },
        });

        const token = this.jwtService.sign(userData)
        console.log(token);
        
        return { token: token, user: newUser };
      }
    } catch (error) {}
  }
}
