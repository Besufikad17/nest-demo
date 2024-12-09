import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { OTPController } from './controllers/otp.controller';
import { OTPRepository } from './repository/otp.repository';
import { OTPService } from './services/otp.services';
import { BcryptUtils } from './utils/bcrypt';
import { UserService } from 'src/user/services/user.service';
import * as Interface from './interfaces';

@Module({
  controllers: [AuthController, OTPController],
  providers: [
    { provide: Interface.IAuthService, useClass: UserService },
    { provide: Interface.IOTPRepository, useClass: OTPRepository },
    { provide: Interface.IOTPService, useClass: OTPService },
    AuthService,
    OTPRepository,
    OTPService,
    BcryptUtils
  ]
})
export class AuthModule { }
