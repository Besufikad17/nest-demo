import { Module } from '@nestjs/common';
import { FcmTokenService } from './services/fcm-token.service';
import { FCMTokenRepository } from './repositories/fcm-token.repository';
import { PrismaModule } from 'src/prisma/prisma.module';
import { FCMTokenController } from './controllers/fcm-token.controller';
import * as Interface from './interfaces';

@Module({
  providers: [
    { provide: Interface.IFCMTokenRepository, useClass: FCMTokenRepository },
    { provide: Interface.IFCMTokenService, useClass: FcmTokenService },
    FcmTokenService,
  ],
  exports: [Interface.IFCMTokenRepository, Interface.IFCMTokenService],
  imports: [PrismaModule],
  controllers: [FCMTokenController]
})
export class FcmTokenModule { }
