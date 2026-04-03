import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { LoginDto, RecoverAccountDto, RegisterDto, ResetPasswordDto, } from "../dto";
import { IAuthService } from "../interfaces";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { DeviceInfoGuard, JwtGuard } from "src/common/guards";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IUser } from "src/common/interfaces";
import { EmptyBodyResponse } from "src/common/entities/api.entity";
import { AuthResponse } from "../entities/auth.entity";
import { ApiOkResponseWithData } from "src/common/helpers/swagger.helper";
import { GetClientIp, GetDeviceInfo, RateLimitPolicy } from "src/common/decorators";
import { IDeviceInfo } from "src/common/interfaces";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: IAuthService) { }

  @Post("login")
  @UseGuards(DeviceInfoGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(AuthResponse)
  @RateLimitPolicy({
    id: "auth_login",
    group: "public",
    identityFields: ["email", "phoneNumber"],
    limits: [
      { scope: "ip", limit: 5, windowSec: 60 },
      { scope: "identity", limit: 5, windowSec: 60 },
    ],
    penalty: {
      failureWindowSec: 600,
      steps: [
        { failures: 5, blockSec: 300 },
        { failures: 10, blockSec: 1800 },
        { failures: 20, blockSec: 86400 },
      ],
    },
  })
  async login(
    @Body() loginDto: LoginDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
  ) {
    return await this.authService.login(loginDto, deviceInfo, ip);
  }

  @Post("register")
  @UseGuards(DeviceInfoGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  @RateLimitPolicy({
    id: "auth_register",
    group: "public",
    identityFields: ["email", "phoneNumber"],
    limits: [
      { scope: "ip", limit: 5, windowSec: 60 },
      { scope: "identity", limit: 3, windowSec: 600 },
    ],
  })
  async register(
    @Body() registerDto: RegisterDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
  ) {
    return await this.authService.register(registerDto, deviceInfo, ip);
  }

  @Get("register/google")
  @UseGuards(AuthGuard("google"))
  @HttpCode(HttpStatus.OK)
  @RateLimitPolicy({
    id: "auth_google_register",
    group: "public",
    limits: [{ scope: "ip", limit: 20, windowSec: 60 }],
  })
  async googleAuthForRegister() {

  }

  @Get("register/google/callback")
  @UseGuards(AuthGuard("google"))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(EmptyBodyResponse)
  @RateLimitPolicy({
    id: "auth_google_callback",
    group: "public",
    limits: [{ scope: "ip", limit: 20, windowSec: 60 }],
  })
  async googleAuthRedirectForRegister(@Req() req: any) {
    return await this.authService.registerUserByGoogleSSO(req.user);
  }

  @Post("password/reset")
  @UseGuards(JwtGuard, DeviceInfoGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  @RateLimitPolicy({
    id: "auth_password_reset",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 20, windowSec: 60 },
      { scope: "user", limit: 20, windowSec: 60 },
    ],
  })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return await this.authService.resetPassword(resetPasswordDto, user.id, deviceInfo, ip);
  }

  @Post("recover")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(EmptyBodyResponse)
  @RateLimitPolicy({
    id: "auth_recover",
    group: "public",
    identityFields: ["value"],
    limits: [
      { scope: "ip", limit: 3, windowSec: 600 },
      { scope: "identity", limit: 3, windowSec: 600 },
    ],
  })
  async recoverAccount(
    @Body() recoverAccountDto: RecoverAccountDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
  ) {
    return await this.authService.recoverAccount(recoverAccountDto, deviceInfo, ip);
  }

  @Post("token/refresh")
  @UseGuards(JwtGuard, DeviceInfoGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(AuthResponse)
  @RateLimitPolicy({
    id: "auth_refresh",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 30, windowSec: 60 },
      { scope: "user", limit: 30, windowSec: 60 },
    ],
  })
  refreshTokens(
    @Headers("authorization") auth: string,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return this.authService.refreshToken({
      userId: user.id, email: user.email!, currentRefreshToken: auth.split(" ")[1]
    }, deviceInfo, ip);
  }
}
