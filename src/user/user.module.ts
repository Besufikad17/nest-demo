import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { UserController } from './user.controller';


@Module({
  imports: [],
  controllers: [UserController],
  providers: [PrismaService],
})
export class UserModule {}
