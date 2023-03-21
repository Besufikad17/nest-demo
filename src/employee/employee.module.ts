import { Module } from '@nestjs/common';
import { PrismaService } from '../utils/prisma.service';
import { EmployeeController } from './employee.controller';


@Module({
  imports: [],
  controllers: [EmployeeController],
  providers: [PrismaService],
})
export class TreeModule {}
