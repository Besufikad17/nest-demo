import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/common/guards";
import { CreateFcmTokenDto } from "../dto/fcm-token.dto";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IUser } from "src/common/interfaces";
import { IFCMTokenService } from "../interfaces";
import { ApiOkResponseWithData } from "src/common/helpers/swagger.helper";
import { EmptyBodyResponse } from "src/common/entities/api.entity";
import { RateLimitPolicy } from "src/common/decorators";

@ApiTags("fcm-token")
@Controller("fcm-token")
export class FCMTokenController {
  constructor(
    private fcmTokenService: IFCMTokenService,
  ) { }

  @Post("fcm-token/register")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOkResponseWithData(EmptyBodyResponse)
  @RateLimitPolicy({
    id: "fcm_token_register",
    group: "sensitive",
    limits: [
      { scope: "ip", limit: 30, windowSec: 60 },
      { scope: "user", limit: 30, windowSec: 60 },
    ],
  })
  async registerToken(@Body() createFcmTokenDto: CreateFcmTokenDto, @GetUser() user: IUser) {
    return await this.fcmTokenService.createFCMToken({
      ...createFcmTokenDto,
      userId: user.id
    });
  }
}
