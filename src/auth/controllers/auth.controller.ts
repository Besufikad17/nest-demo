import { Body, Controller, Get, Headers, HttpCode, HttpStatus, Ip, Post, Req, UseGuards } from '@nestjs/common';
import { LoginDto, RecoverAccountDto, RegisterDto, ResetPasswordDto, } from '../dto';
import { IAuthService } from '../interfaces';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '../guards/JwtAuthGuard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IUser } from 'src/common/interfaces';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: IAuthService) { }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Headers('device-info') deviceInfo: string,
    @Ip() ip: string
  ) {
    return await this.authService.login(loginDto, deviceInfo, ip);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Headers('device-info') deviceInfo: string,
    @Ip() ip: string
  ) {
    return await this.authService.register(registerDto, deviceInfo, ip);
  }

  @Get('register/google')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('google'))
  async googleAuthForRegister() { }

  @Get('register/google/callback')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirectForRegister(@Req() req: any) {
    return await this.authService.registerUserByGoogleSSO(req.user);
  }

  @Post('reset/password')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtGuard)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @GetUser() user: IUser,
    @Headers('device-info') deviceInfo: string,
    @Ip() ip: string
  ) {
    return await this.authService.resetPassword(resetPasswordDto, user.id, deviceInfo, ip);
  }

  @Post('recover')
  @HttpCode(HttpStatus.OK)
  async recoverAccount(
    @Body() recoverAccountDto: RecoverAccountDto,
    @Headers('device-info') deviceInfo: string,
    @Ip() ip: string
  ) {
    return await this.authService.recoverAccount(recoverAccountDto, deviceInfo, ip);
  }

  @UseGuards(JwtGuard)
  @Post('refresh-tokens')
  refreshTokens(@Headers('authorization') auth: string, @GetUser() user: IUser) {
    return this.authService.refreshToken(user.id, user.email!, auth.split(' ')[1]);
  }
}
