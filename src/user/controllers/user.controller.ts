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
import { GetClientIp, GetDeviceInfo } from "src/common/decorators";
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
  async getUserAdmin(@Param("id") id: string) {
    return await this.userService.findUser({ id: id }, RoleEnums.ADMIN, false);
  }

  @Get(":id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(FindUserResponse)
  async getUser(@Param("id") id: string, @GetUser() user: IUser) {
    return await this.userService.findUser({ id: id }, RoleEnums.USER, false, user.id);
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER, RoleEnums.ADMIN)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(EmptyBodyResponse)
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
  async deleteAccount(
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return await this.userService.deleteUser(user.id!, deviceInfo, ip);
  }
}
