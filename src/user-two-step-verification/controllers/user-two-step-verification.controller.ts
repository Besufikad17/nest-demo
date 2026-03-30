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
import { GetClientIp, GetDeviceInfo, PaginationLimit, RateLimitPolicy } from "src/common/decorators";
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
  @RateLimitPolicy({
    id: "2fa_add",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 20, windowSec: 60 },
      { scope: "user", limit: 20, windowSec: 60 },
    ],
  })
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
  @PaginationLimit({ defaultTake: 20, maxTake: 100, maxSkip: 10000 })
  @RateLimitPolicy({
    id: "2fa_all",
    group: "read",
    limits: [
      { scope: "ip", limit: 120, windowSec: 60 },
      { scope: "user", limit: 120, windowSec: 60 },
    ],
  })
  async get2FaMethods(@GetUser() user: IUser) {
    return await this.userTwoStepVerificationService.finUserTwoStepVerifications(user.id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOkResponseWithData(UserTwoStepVerificationResponse)
  @RateLimitPolicy({
    id: "2fa_primary_lookup",
    group: "public",
    identityFields: ["value"],
    limits: [
      { scope: "ip", limit: 10, windowSec: 600 },
      { scope: "identity", limit: 10, windowSec: 600 },
    ],
  })
  async get2FaMethod(@Body() getPrimary2faDto: GetPrimary2FaDto) {
    return await this.userTwoStepVerificationService.getPrimary2Fa(getPrimary2faDto);
  }

  @Put("update/:id")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  @RateLimitPolicy({
    id: "2fa_update",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 20, windowSec: 60 },
      { scope: "user", limit: 20, windowSec: 60 },
    ],
  })
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
  @RateLimitPolicy({
    id: "2fa_verify",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 10, windowSec: 60 },
      { scope: "user", limit: 10, windowSec: 60 },
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
  @RateLimitPolicy({
    id: "2fa_delete",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 20, windowSec: 60 },
      { scope: "user", limit: 20, windowSec: 60 },
    ],
  })
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
  @RateLimitPolicy({
    id: "2fa_passkey_add_request",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 20, windowSec: 60 },
      { scope: "user", limit: 20, windowSec: 60 },
    ],
  })
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
  @RateLimitPolicy({
    id: "2fa_passkey_add",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 10, windowSec: 60 },
      { scope: "user", limit: 10, windowSec: 60 },
    ],
  })
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
  @RateLimitPolicy({
    id: "2fa_passkey_verify_request",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 20, windowSec: 60 },
      { scope: "user", limit: 20, windowSec: 60 },
    ],
  })
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
  @RateLimitPolicy({
    id: "2fa_passkey_verify",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 10, windowSec: 60 },
      { scope: "user", limit: 10, windowSec: 60 },
    ],
    penalty: {
      failureWindowSec: 600,
      steps: [
        { failures: 5, blockSec: 300 },
        { failures: 10, blockSec: 1800 },
      ],
    },
  })
  async verifyPasskey(
    @Body() verifyPasskeyDto: VerifyPasskeyDto,
    @GetUser() user: IUser,
    @GetClientIp() ip: string,
    @GetDeviceInfo() deviceInfo: IDeviceInfo,
  ) {
    return this.userTwoStepVerificationService.verifyPasskey(verifyPasskeyDto, user.id, deviceInfo, ip);
  }
}
