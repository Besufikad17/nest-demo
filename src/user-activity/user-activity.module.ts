import { Module } from '@nestjs/common';
import { UserActivityService } from './services/user-activity.service';
import * as Interface from './interfaces';
import { UserActivityRepository } from './repositories/user-activity.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UserActivityController } from './controllers/user-activity.controller';

@Module({
  providers: [
    { provide: Interface.IUserActivityRepository, useClass: UserActivityRepository },
    { provide: Interface.IUserActivityService, useClass: UserActivityService },
    UserActivityRepository,
    UserActivityService
  ],
  exports: [Interface.IUserActivityRepository, Interface.IUserActivityService],
  imports: [PrismaModule],
  controllers: [UserActivityController]
})
export class UserActivityModule { }
