import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/common/guards";
import {
  AddPasskeyDto,
  CreateUserTwoStepVerificationDto,
  GetPrimary2FaDto,
  UpdateUserTwoStepVerifcationDto,
  VerifyPasskeyDto,
  VerifyUserTwoStepVerificationDto
} from "../dto/user-two-step-verification.dto";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IDeviceInfo, IUser } from "src/common/interfaces";
import { IUserTwoStepVerificationService } from "../interfaces";
import { GetClientIp, GetDeviceInfo } from "src/common/decorators";
import { ApiOkResponseWithData } from "src/common/helpers/swagger.helper";
import { Create2FAResponse, PublicKeyCredentialCreationOptionsJSONResponse, PublicKeyCredentialRequestOptionsJSONResponse, UserTwoStepVerificationResponse, Verify2FAResponse } from "../entities/user-two-step-verification.entity";
import { EmptyBodyResponse } from "src/common/entities/api.entity";

@ApiTags("user-two-step-verification")
@Controller("auth/2fa")
export class UserTwoStepVerificationController {
  constructor(private userTwoStepVerificationService: IUserTwoStepVerificationService) { }

  @Post("add")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponseWithData(Create2FAResponse)
  async add2FaMethod(
    @Body() createUserTwoStepVerificationDto: CreateUserTwoStepVerificationDto,
    @GetUser() user: IUser,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
  ) {
    return await this.userTwoStepVerificationService.createUserTwoStepVerification(createUserTwoStepVerificationDto, user.id, user.email!, deviceInfo, ip);
  }

  @Get("all")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(UserTwoStepVerificationResponse, true)
  async get2FaMethods(@GetUser() user: IUser) {
    return await this.userTwoStepVerificationService.finUserTwoStepVerifications(user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(UserTwoStepVerificationResponse)
  async get2FaMethod(@Body() getPrimary2faDto: GetPrimary2FaDto) {
    return await this.userTwoStepVerificationService.getPrimary2Fa(getPrimary2faDto);
  }

  @Put("update/:id")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async update2FaUpdate(
    @Body() updateUsetTwoStepVerificationDto: UpdateUserTwoStepVerifcationDto,
    @Param("id") methodId: string,
    @GetUser() user: IUser,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo
  ) {
    const { id, ...withoutId } = updateUsetTwoStepVerificationDto;
    return await this.userTwoStepVerificationService.updateUserTwoStepVerification({
      id: methodId,
      ...withoutId
    }, user.id, deviceInfo, ip);
  }

  @Post("verify")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(Verify2FAResponse)
  async verify2FaCode(
    @Body() verifyUserTwoStepVerificationDto: VerifyUserTwoStepVerificationDto,
    @GetUser() user: IUser,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo
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
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo
  ) {
    return await this.userTwoStepVerificationService.deleteUserTwoStepVerification(id, user.id, deviceInfo, ip);
  }

  @Post("passkey/add/request")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(PublicKeyCredentialCreationOptionsJSONResponse)
  async requestAddPasskey(
    @GetUser() user: IUser,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo
  ) {
    return this.userTwoStepVerificationService.requestAddPasskey(user.id, deviceInfo, ip);
  }

  @Post("passkey/add")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  async addPasskey(
    @Body() adddPasskeyDto: AddPasskeyDto,
    @GetUser() user: IUser,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo
  ) {
    return this.userTwoStepVerificationService.addPasskey(adddPasskeyDto, user.id, deviceInfo, ip);
  }

  @Post("passkey/verify/request")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(PublicKeyCredentialRequestOptionsJSONResponse)
  async requestVerifyPasskey(
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
    @GetUser() user: IUser
  ) {
    return this.userTwoStepVerificationService.requestVerifyPasskey(user.id, deviceInfo, ip);
  }

  @Post("passkey/verify")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(Verify2FAResponse)
  async verifyPasskey(
    @Body() verifyPasskeyDto: VerifyPasskeyDto,
    @GetUser() user: IUser,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
  ) {
    return this.userTwoStepVerificationService.verifyPasskey(verifyPasskeyDto, user.id, deviceInfo, ip);
  }
}
