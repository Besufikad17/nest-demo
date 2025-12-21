import { Body, Controller, Delete, Get, Headers, HttpCode, HttpStatus, Ip, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/auth/guards/JwtAuthGuard";
import {
  AddPasskeyDto,
  CreateUserTwoStepVerificationDto,
  GetPrimary2FaDto,
  UpdateUserTwoStepVerifcationDto,
  VerifyPasskeyDto,
  VerifyUserTwoStepVerificationDto
} from "../dto/user-two-step-verification.dto";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IUser } from "src/common/interfaces";
import { IUserTwoStepVerificationService } from "../interfaces";

@ApiTags("user-two-step-verification")
@Controller("auth/2fa")
export class UserTwoStepVerificationController {
  constructor(private userTwoStepVerificationService: IUserTwoStepVerificationService) { }

  @Post("add")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtGuard)
  async add2FaMethod(
    @Body() createUserTwoStepVerificationDto: CreateUserTwoStepVerificationDto,
    @GetUser() user: IUser,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string
  ) {
    const { userId, ...withoutUserId } = createUserTwoStepVerificationDto;
    return await this.userTwoStepVerificationService.createUserTwoStepVerification({
      userId: user.id,
      ...withoutUserId
    }, user.email!, deviceInfo, ip);
  }

  @Get("all")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async get2FaMethods(@GetUser() user: IUser) {
    return await this.userTwoStepVerificationService.finUserTwoStepVerifications(user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async get2FaMethod(@Body() getPrimary2faDto: GetPrimary2FaDto) {
    return await this.userTwoStepVerificationService.getPrimary2Fa(getPrimary2faDto);
  }

  @Put("update/:id")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtGuard)
  async update2FaUpdate(
    @Body() updateUsetTwoStepVerificationDto: UpdateUserTwoStepVerifcationDto,
    @Param("id") methodId: string,
    @GetUser() user: IUser,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string
  ) {
    const { id, ...withoutId } = updateUsetTwoStepVerificationDto;
    return await this.userTwoStepVerificationService.updateUserTwoStepVerification({
      id: methodId,
      ...withoutId
    }, user.id, deviceInfo, ip);
  }

  @Post("verify")
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  async verify2FaCode(
    @Body() verifyUserTwoStepVerificationDto: VerifyUserTwoStepVerificationDto,
    @GetUser() user: IUser,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string
  ) {
    return await this.userTwoStepVerificationService.verifyUserTwoStepVerification(
      verifyUserTwoStepVerificationDto, user.id, deviceInfo, ip);
  }

  @Delete("delete/:id")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtGuard)
  async delete2FaMethod(
    @Param("id") id: string,
    @GetUser() user: IUser,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string
  ) {
    return await this.userTwoStepVerificationService.deleteUserTwoStepVerification(id, user.id, deviceInfo, ip);
  }

  @Post("passkey/add/request")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtGuard)
  async requestAddPasskey(
    @GetUser() user: IUser,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string
  ) {
    return this.userTwoStepVerificationService.requestAddPasskey(user.id, deviceInfo, ip);
  }

  @Post("passkey/add")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtGuard)
  async addPasskey(
    @Body() adddPasskeyDto: AddPasskeyDto,
    @GetUser() user: IUser,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string
  ) {
    return this.userTwoStepVerificationService.addPasskey(adddPasskeyDto, user.id, deviceInfo, ip);
  }

  @Post("passkey/verify/request")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtGuard)
  async requestVerifyPasskey(@GetUser() user: IUser, @Headers("device-info") deviceInfo: string, @Ip() ip: string) {
    return this.userTwoStepVerificationService.requestVerifyPasskey(user.id, deviceInfo, ip);
  }

  @Post("passkey/verify")
  @HttpCode(HttpStatus.ACCEPTED)
  @UseGuards(JwtGuard)
  async verifyPasskey(
    @Body() verifyPasskeyDto: VerifyPasskeyDto,
    @GetUser() user: IUser,
    @Headers("device-info") deviceInfo: string,
    @Ip() ip: string
  ) {
    return this.userTwoStepVerificationService.verifyPasskey(verifyPasskeyDto, user.id, deviceInfo, ip);
  }
}
