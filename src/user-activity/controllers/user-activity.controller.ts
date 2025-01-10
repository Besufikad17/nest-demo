import { Body, Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from '@nestjs/common';
import { IFileUploadEvent, IUserActivityService } from '../interfaces';
import { EventPattern } from '@nestjs/microservices';
import { JwtGuard } from 'src/auth/guards/JwtAuthGuard';
import { FindUserActivityDto } from '../dto/user-activity.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IUser } from 'src/common/interfaces';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/auth/guards';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RoleEnums } from 'src/user-role/enums/role.enum';

@ApiTags('user-activity')
@Controller('user/activity')
export class UserActivityController {
  constructor(private userActivityService: IUserActivityService) { }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  async getActivityLogs(
    @Body() findUserActivityDto: FindUserActivityDto,
    @GetUser() user: IUser,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return await this.userActivityService.findUserActivities(findUserActivityDto, user.id, skip, take);
  }

  @Get('admin/all')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getUsersActivities(
    @Body() findUserActivityDto: FindUserActivityDto,
    @Query('user') userId?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number
  ) {
    return await this.userActivityService.findUserActivities(findUserActivityDto, userId, skip, take);
  }

  @Get(':id')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.OK)
  async getActivityLog(
    @Param('id') id: string,
    @GetUser() user: IUser,
  ) {
    return await this.userActivityService.findUserActivity(id, RoleEnums.USER, user.id);
  }

  @Get('admin/:id')
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getUsersActivityAdmin(
    @Param('id') id: string
  ) {
    return await this.userActivityService.findUserActivity(id, RoleEnums.ADMIN);
  }

  @EventPattern('file_uploaded')
  async createUserActivity(data: IFileUploadEvent) {
    return this.userActivityService.onFileUploadEventListener({
      userId: data.userId,
      profileId: data.profileId,
      action: data.action,
      deviceInfo: data.deviceInfo,
      ip: data.ip,
      actionTimestamp: data.actionTimestamp
    });
  }
}
