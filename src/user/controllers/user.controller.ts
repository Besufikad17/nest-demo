import { Body, Controller, Delete, Get, Headers, HttpCode, HttpException, HttpStatus, Ip, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { IUserService } from "../interfaces";
import { ApiTags } from "@nestjs/swagger";
import { User, USER_ACCOUNT_STATUS } from "generated/prisma/client"
import { JwtGuard, RoleGuard } from "src/auth/guards";
import { Roles } from "src/common/decorators/roles.decorator";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IUser } from "src/common/interfaces";
import { FindUsersDto, UpdateUserDto } from "../dto/user.dto";
import { addMinutes } from "src/common/utils/date.utils";
import { IOtpService } from "src/otp/interfaces";

@ApiTags("user")
@Controller("user")
export class UserController {
  constructor(
    private otpService: IOtpService,
    private userService: IUserService
  ) { }

  @Get("all")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getUsers(
    @Body() findUsersDto: FindUsersDto,
    @Query("text") text?: string,
    @Query("skip") skip?: number,
    @Query("take") take?: number,
    @Query("status") status?: USER_ACCOUNT_STATUS,
    @Query("active") active?: boolean
  ) {
    return await this.userService.findUsers(findUsersDto, text, skip, take, status, active);
  }

  @Get("admin/:id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.ADMIN)
  @HttpCode(HttpStatus.OK)
  async getUserAdmin(@Param("id") id: string) {
    return await this.userService.findUser({ id: id }, RoleEnums.ADMIN);
  }

  @Get(":id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.OK)
  async getUser(@Param("id") id: string, @GetUser() user: IUser) {
    const userInDB = await this.userService.findUser({ id: id }, RoleEnums.USER, user.id);
    return {
      id: userInDB?.id,
      email: userInDB?.email,
      phoneNumber: userInDB?.phoneNumber,
      passwordExists: userInDB?.passwordHash !== undefined && userInDB?.passwordHash !== null,
      accountStatus: userInDB?.accountStatus,
      isActive: userInDB?.isActive,
      lastLogin: userInDB?.lastLogin,
      twoStepEnabled: userInDB?.twoStepEnabled,
      updatedAt: userInDB?.updatedAt
    }
  }

  @Patch(":id")
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: IUser,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string
  ) {
    const otp = await this.otpService.getOTP({ userId: user.id, type: "TWO_FACTOR_AUTHENTICATION" });

    if ((otp && (otp.status !== "VERIFIED" || otp.updatedAt < addMinutes(new Date(), -3))) || !otp) {
      throw new HttpException("Please verify your action first!!", HttpStatus.BAD_REQUEST);
    }

    return await this.userService.updateUser(updateUserDto, user.id, deviceInfo, ip);
  }

  @Delete()
  @UseGuards(JwtGuard, RoleGuard)
  @Roles(RoleEnums.USER)
  @HttpCode(HttpStatus.ACCEPTED)
  async deleteAccount(
    @GetUser() user: IUser,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string
  ) {
    return await this.userService.deleteUser(user.id!, deviceInfo, ip);
  }
}
