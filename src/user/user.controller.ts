import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/utils/prisma.service';
import * as jwt from "jsonwebtoken";
import * as bcrypt from 'bcryptjs';

@Controller('api/user')
export class UserController {
  constructor(
    private readonly prismaService: PrismaService,
  ) {}

  @Post('/signup')
  async signup(
    @Body() userData: { username: string; email: string; password: string },
  ): Promise<any> {
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
          HttpStatus.BAD_REQUEST,
        );
      }

      const newUser = await this.prismaService.user.create({
        data: {
          username,
          email,
          password: pwd,
        },
      });

      const token = jwt.sign( userData, process.env.JWT_SECRET, {
        expiresIn: '2 days',
      });

      return { token: token, user: newUser };
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

  @Post("/login")
  async login(@Body() loginData: { username: string, password: string }): Promise<any> {
    const { username, password } = loginData;

    if(!username || !password){
      throw new HttpException(
        'Please enter all fields!!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    try {
      const u = await this.prismaService.user.findMany({
        where: {
          username
        }
      })

      if(u[0]){
        const isMatch = bcrypt.compareSync(password, u[0].password);
        if(isMatch){
          const token = jwt.sign( u[0], process.env.JWT_SECRET, {
            expiresIn: '2 days',
          });
    
          return { token: token, user: u[0] };
        }else{
          throw new HttpException(
            'Invalid credentials!!',
            HttpStatus.NOT_ACCEPTABLE
          )
        }
      }else{
        throw new HttpException(
          'User not found!!',
          HttpStatus.BAD_REQUEST
        )
      }
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
