import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { GenerateOtpDto, VerifyOtpDto } from "../dto/otp.dto";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IDeviceInfo, IUser } from "src/common/interfaces";
import { ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/common/guards";
import { IOtpService } from "../interfaces/otp.service.interface";
import { GetClientIp, GetDeviceInfo } from "src/common/decorators";

@ApiTags("otp")
@Controller("auth/otp")
export class OtpController {
  constructor(private readonly optService: IOtpService) { }

  @Post("request")
  @HttpCode(HttpStatus.CREATED)
  async sendOTP(@Body() generateOTPDto: GenerateOtpDto) {
    return await this.optService.createOTP(generateOTPDto);
  }

  @Post("user/request")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async sendUserOTP(
    @Body() generateOTPDto: GenerateOtpDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return await this.optService.createOTP({ ...generateOTPDto, userId: user.id }, deviceInfo, ip);
  }

  @Post("resend")
  @HttpCode(HttpStatus.CREATED)
  async resendOTP(@Body() generateOTPDto: GenerateOtpDto) {
    return await this.optService.resendOTP(generateOTPDto);
  }

  @Post("user/resend")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async resendUserOTP(
    @Body() generateOTPDto: GenerateOtpDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return await this.optService.resendOTP({ ...generateOTPDto, userId: user.id }, deviceInfo, ip);
  }

  @Post("validate")
  @HttpCode(HttpStatus.OK)
  async validateOTP(@Body() verifyOTPDto: VerifyOtpDto) {
    return await this.optService.verifyOTP(verifyOTPDto);
  }

  @Post("user/validate")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async validateUserOTP(
    @Body() verifyOTPDto: VerifyOtpDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return await this.optService.verifyOTP({ ...verifyOTPDto, userId: user.id }, deviceInfo, ip);
  }
}
