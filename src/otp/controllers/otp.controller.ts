import { Body, Controller, Headers, HttpCode, HttpStatus, Ip, Post, UseGuards } from '@nestjs/common';
import { GenerateOtpDto, VerifyOtpDto } from '../dto/otp.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IUser } from 'src/common/interfaces';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards';
import { IOtpService } from '../interfaces/otp.service.interface';

@ApiTags('otp')
@Controller('auth/otp')
export class OtpController {
  constructor(private readonly optService: IOtpService) { }

  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  async sendOTP(@Body() generateOTPDto: GenerateOtpDto) {
    return await this.optService.createOTP(generateOTPDto);
  }

  @Post('user/request')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async sendUserOTP(@Body() generateOTPDto: GenerateOtpDto, @GetUser() user: IUser, @Headers('device-info') deviceInfo: string, @Ip() ip: string) {
    return await this.optService.createOTP({ ...generateOTPDto, userId: user.id }, deviceInfo, ip);
  }

  @Post('resend')
  @HttpCode(HttpStatus.CREATED)
  async resendOTP(@Body() generateOTPDto: GenerateOtpDto) {
    return await this.optService.resendOTP(generateOTPDto);
  }

  @Post('user/resend')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async resendUserOTP(@Body() generateOTPDto: GenerateOtpDto, @GetUser() user: IUser, @Headers('device-info') deviceInfo: string, @Ip() ip: string) {
    return await this.optService.resendOTP({ ...generateOTPDto, userId: user.id }, deviceInfo, ip);
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateOTP(@Body() verifyOTPDto: VerifyOtpDto) {
    return await this.optService.verifyOTP(verifyOTPDto);
  }

  @Post('user/validate')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async validateUserOTP(@Body() verifyOTPDto: VerifyOtpDto, @GetUser() user: IUser, @Headers('device-info') deviceInfo: string, @Ip() ip: string) {
    return await this.optService.verifyOTP({ ...verifyOTPDto, userId: user.id }, deviceInfo, ip);
  }
}
