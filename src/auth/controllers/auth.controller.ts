import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Post, Req, UseGuards } from "@nestjs/common";
import { LoginDto, RecoverAccountDto, RegisterDto, ResetPasswordDto, } from "../dto";
import { IAuthService } from "../interfaces";
import { AuthGuard } from "@nestjs/passport";
import { ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/common/guards";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IUser } from "src/common/interfaces";
import { EmptyBodyResponse } from "src/common/entities/api.entity";
import { AuthResponse } from "../entities/auth.entity";
import { ApiOkResponseWithData } from "src/common/helpers/swagger.helper";
import { GetClientIp, GetDeviceInfo } from "src/common/decorators";
import { HeadersDto } from "src/common/dto/headers.dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: IAuthService) { }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(AuthResponse)
  async login(
    @Body() loginDto: LoginDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() { deviceInfo }: HeadersDto,
  ) {
    return await this.authService.login(loginDto, deviceInfo, ip);
  }

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async register(
    @Body() registerDto: RegisterDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() { deviceInfo }: HeadersDto,
  ) {
    return await this.authService.register(registerDto, deviceInfo, ip);
  }

  @Get("register/google")
  @UseGuards(AuthGuard("google"))
  @HttpCode(HttpStatus.OK)
  async googleAuthForRegister() { }

  @Get("register/google/callback")
  @UseGuards(AuthGuard("google"))
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async googleAuthRedirectForRegister(@Req() req: any) {
    return await this.authService.registerUserByGoogleSSO(req.user);
  }

  @Post("password/reset")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() { deviceInfo }: HeadersDto,
    @GetUser() user: IUser
  ) {
    return await this.authService.resetPassword(resetPasswordDto, user.id, deviceInfo, ip);
  }

  @Post("recover")
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async recoverAccount(
    @Body() recoverAccountDto: RecoverAccountDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() { deviceInfo }: HeadersDto,
  ) {
    return await this.authService.recoverAccount(recoverAccountDto, deviceInfo, ip);
  }

  @Post("token/refresh")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(AuthResponse)
  refreshTokens(
    @Headers("authorization") auth: string, 
    @GetClientIp() ip: string,
    @GetDeviceInfo() { deviceInfo }: HeadersDto,
    @GetUser() user: IUser
  ) {
    return this.authService.refreshToken({ 
      userId: user.id, email: user.email!, currentRefreshToken: auth.split(" ")[1] 
    }, deviceInfo, ip);
  }
}