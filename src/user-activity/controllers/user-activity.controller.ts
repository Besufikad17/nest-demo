import { Body, Controller, Get, HttpCode, HttpStatus, Param, Query, UseGuards } from "@nestjs/common";
import { IUserActivityService } from "../interfaces";
import { JwtGuard } from "src/common/guards/JwtAuthGuard";
import { FindUserActivityDto } from "../dto/user-activity.dto";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IUser } from "src/common/interfaces";
import { ApiTags } from "@nestjs/swagger";
import { RoleGuard } from "src/common/guards";
import { Roles } from "src/common/decorators/roles.decorator";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { ApiOkResponseWithData } from "src/common/helpers/swagger.helper";
import { UserActivityLogResponse } from "../entities/user-activity.entity";
import { PaginationLimit, RateLimitPolicy } from "src/common/decorators";

@ApiTags("user-activity")
@Controller("user/activity")
export class UserActivityController {
  constructor(private userActivityService: IUserActivityService) { }

  @Get("all")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(UserActivityLogResponse, true)
  @PaginationLimit({ defaultTake: 20, maxTake: 100, maxSkip: 10000 })
  @RateLimitPolicy({
    id: "user_activity_all",
    group: "read",
    limits: [
      { scope: "ip", limit: 120, windowSec: 60 },
      { scope: "user", limit: 120, windowSec: 60 },
    ],
  })
  async getActivityLogs(
    @Body() findUserActivityDto: FindUserActivityDto,
    @GetUser() user: IUser,
    @Query("skip") skip?: number,
    @Query("take") take?: number,
  ) {
    return await this.userActivityService.findUserActivities(findUserActivityDto, user.id, skip, take);
  }

  @Get("admin/all")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(UserActivityLogResponse, true)
  @PaginationLimit({ defaultTake: 20, maxTake: 100, maxSkip: 10000 })
  @RateLimitPolicy({
    id: "user_activity_admin_all",
    group: "read",
    limits: [
      { scope: "ip", limit: 120, windowSec: 60 },
      { scope: "user", limit: 120, windowSec: 60 },
    ],
  })
  async getUsersActivities(
    @Body() findUserActivityDto: FindUserActivityDto,
    @Query("user") userId?: string,
    @Query("skip") skip?: number,
    @Query("take") take?: number
  ) {
    return await this.userActivityService.findUserActivities(findUserActivityDto, userId, skip, take);
  }

  @Get(":id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(UserActivityLogResponse)
  @RateLimitPolicy({
    id: "user_activity_get",
    group: "read",
    limits: [
      { scope: "ip", limit: 120, windowSec: 60 },
      { scope: "user", limit: 120, windowSec: 60 },
    ],
  })
  async getActivityLog(
    @Param("id") id: string,
    @GetUser() user: IUser,
  ) {
    return await this.userActivityService.findUserActivity(id, RoleEnums.USER, user.id);
  }

  @Get("admin/:id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(UserActivityLogResponse)
  @RateLimitPolicy({
    id: "user_activity_admin_get",
    group: "read",
    limits: [
      { scope: "ip", limit: 120, windowSec: 60 },
      { scope: "user", limit: 120, windowSec: 60 },
    ],
  })
  async getUsersActivityAdmin(
    @Param("id") id: string
  ) {
    return await this.userActivityService.findUserActivity(id, RoleEnums.ADMIN);
  }
}
