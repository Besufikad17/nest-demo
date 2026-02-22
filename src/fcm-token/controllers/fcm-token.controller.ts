import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { JwtGuard } from "src/common/guards";
import { CreateFcmTokenDto } from "../dto/fcm-token.dto";
import { GetUser } from "src/common/decorators/get-user.decorator";
import { IUser } from "src/common/interfaces";
import { IFCMTokenService } from "../interfaces";

@ApiTags("fcm-token")
@Controller("fcm-token")
export class FCMTokenController {
  constructor(
    private fcmTokenService: IFCMTokenService,
  ) { }

  @Post("fcm-token/register")
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async registerToken(@Body() createFcmTokenDto: CreateFcmTokenDto, @GetUser() user: IUser) {
    return await this.fcmTokenService.createFCMToken({
      ...createFcmTokenDto,
      userId: user.id
    });
  }
}
