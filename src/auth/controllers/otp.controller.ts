import { Body, Controller, Headers, HttpCode, HttpStatus, Ip, Post, UseGuards } from '@nestjs/common';
import { IOtpService } from '../interfaces';
import { GenerateOTPDto, VerifyOTPDto } from '../dto/otp.dto';
import { JwtGuard } from '../guards/JwtAuthGuard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IUser } from 'src/common/interfaces';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('otp')
@Controller('auth/otp')
export class OTPController {
  constructor(private readonly optService: IOtpService) { }

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  async sendOTP(@Body() generateOTPDto: GenerateOTPDto) {
    return await this.optService.createOTP(generateOTPDto);
  }

  @Post('user/send')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async sendUserOTP(@Body() generateOTPDto: GenerateOTPDto, @GetUser() user: IUser, @Headers('device-info') deviceInfo: string, @Ip() ip: string) {
    return await this.optService.createOTP({ ...generateOTPDto, userId: user.id }, deviceInfo, ip);
  }

  @Post('resend')
  @HttpCode(HttpStatus.CREATED)
  async resendOTP(@Body() generateOTPDto: GenerateOTPDto) {
    return await this.optService.resendOTP(generateOTPDto);
  }

  @Post('user/resend')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async resendUserOTP(@Body() generateOTPDto: GenerateOTPDto, @GetUser() user: IUser, @Headers('device-info') deviceInfo: string, @Ip() ip: string) {
    return await this.optService.resendOTP({ ...generateOTPDto, userId: user.id }, deviceInfo, ip);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateOTP(@Body() verifyOTPDto: VerifyOTPDto) {
    return await this.optService.verifyOTP(verifyOTPDto);
  }

  @Post('user/validate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async validateUserOTP(@Body() verifyOTPDto: VerifyOTPDto, @GetUser() user: IUser, @Headers('device-info') deviceInfo: string, @Ip() ip: string) {
    return await this.optService.verifyOTP({ ...verifyOTPDto, userId: user.id }, deviceInfo, ip);
  }
}
