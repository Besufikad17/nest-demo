import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserController } from './user.controller';


@Module({
  imports: [],
  controllers: [UserController],
  providers: [PrismaService, JwtService],
})
export class UserModule {}
