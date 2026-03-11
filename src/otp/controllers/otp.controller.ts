import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { GenerateOtpDto, VerifyOtpDto } from "../dto/otp.dto";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IDeviceInfo, IUser } from "src/common/interfaces";
import { ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/common/guards";
import { IOtpService } from "../interfaces/otp.service.interface";
import { GetClientIp, GetDeviceInfo } from "src/common/decorators";
import { EmptyBodyResponse } from "src/common/entities/api.entity";
import { ApiOkResponseWithData } from "src/common/helpers/swagger.helper";

@ApiTags("otp")
@Controller("auth/otp")
export class OtpController {
  constructor(private readonly optService: IOtpService) { }

  @Post("request")
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async sendOTP(@Body() generateOTPDto: GenerateOtpDto) {
    return await this.optService.createOTP(generateOTPDto);
  }

  @Post("user/request")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponseWithData(EmptyBodyResponse)
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
  @ApiOkResponseWithData(EmptyBodyResponse)
  async resendOTP(@Body() generateOTPDto: GenerateOtpDto) {
    return await this.optService.resendOTP(generateOTPDto);
  }

  @Post("user/resend")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponseWithData(EmptyBodyResponse)
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
  @ApiOkResponseWithData(EmptyBodyResponse)
  async validateOTP(@Body() verifyOTPDto: VerifyOtpDto) {
    return await this.optService.verifyOTP(verifyOTPDto);
  }

  @Post("user/validate")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async validateUserOTP(
    @Body() verifyOTPDto: VerifyOtpDto,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return await this.optService.verifyOTP({ ...verifyOTPDto, userId: user.id }, deviceInfo, ip);
  }
}
