import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/auth/guards';
import { RegisterFcmTokenDto } from '../dto/notification.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { IUser } from 'src/common/interfaces';
import { IFcmTokenService } from '../interfaces';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(
    private fcmTokenService: IFcmTokenService
  ) { }

  @Post('fcm-token/register')
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.CREATED)
  async registerToken(@Body() registerFcmTokenDto: RegisterFcmTokenDto, @GetUser() user: IUser) {
    return await this.fcmTokenService.registerFcmToken(registerFcmTokenDto, user.id);
  }
}
