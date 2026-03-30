import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { IUserService } from "../interfaces";
import { ApiTags } from "@nestjs/swagger";
import { UserAccountStatus } from "generated/prisma/client"
import { JwtGuard, RoleGuard } from "src/common/guards";
import { Roles } from "src/common/decorators/roles.decorator";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IDeviceInfo, IUser } from "src/common/interfaces";
import { FindUsersDto, UpdateUserDto } from "../dto/user.dto";
import { GetClientIp, GetDeviceInfo, PaginationLimit, RateLimitPolicy } from "src/common/decorators";
import { ApiOkResponseWithData } from "src/common/helpers/swagger.helper";
import { EmptyBodyResponse } from "src/common/entities/api.entity";
import { FindUserResponse, FindUsersResponse } from "../entities/user.entity";

@ApiTags("user")
@Controller("user")
export class UserController {
  constructor(
    private userService: IUserService
  ) { }

  @Get("all")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(FindUsersResponse, true)
  @PaginationLimit({ defaultTake: 20, maxTake: 100, maxSkip: 10000 })
  @RateLimitPolicy({
    id: "user_all",
    group: "read",
    limits: [
      { scope: "ip", limit: 120, windowSec: 60 },
      { scope: "user", limit: 120, windowSec: 60 },
    ],
  })
  async getUsers(
    @Body() findUsersDto: FindUsersDto,
    @Query("text") text?: string,
    @Query("skip") skip?: number,
    @Query("take") take?: number,
    @Query("status") status?: UserAccountStatus,
    @Query("active") active?: boolean
  ) {
    return await this.userService.findUsers(findUsersDto, text, skip, take, status, active);
  }

  @Get("admin/:id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(FindUserResponse)
  @RateLimitPolicy({
    id: "user_admin_get",
    group: "read",
    limits: [
      { scope: "ip", limit: 120, windowSec: 60 },
      { scope: "user", limit: 120, windowSec: 60 },
    ],
  })
  async getUserAdmin(@Param("id") id: string) {
    return await this.userService.findUser({ id: id }, RoleEnums.ADMIN, false);
  }

  @Get(":id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(FindUserResponse)
  @RateLimitPolicy({
    id: "user_get",
    group: "read",
    limits: [
      { scope: "ip", limit: 120, windowSec: 60 },
      { scope: "user", limit: 120, windowSec: 60 },
    ],
  })
  async getUser(@Param("id") id: string, @GetUser() user: IUser) {
    return await this.userService.findUser({ id: id }, RoleEnums.USER, false, user.id);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER, RoleEnums.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  @RateLimitPolicy({
    id: "user_update",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 20, windowSec: 60 },
      { scope: "user", limit: 20, windowSec: 60 },
    ],
  })
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return await this.userService.updateAccount(updateUserDto, user.id, deviceInfo, ip);
  }

  @Delete()
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  @RateLimitPolicy({
    id: "user_delete",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 10, windowSec: 60 },
      { scope: "user", limit: 10, windowSec: 60 },
    ],
  })
  async deleteAccount(
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return await this.userService.deleteUser(user.id!, deviceInfo, ip);
  }
}
