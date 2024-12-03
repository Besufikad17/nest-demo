import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthRepository } from './repository/auth.repository';
import { OTPController } from './controllers/otp.controller';
import { OTPRepository } from './repository/otp.repository';
import { OTPService } from './services/otp.services';
import { BcryptUtils } from './utils/bcrypt';

@Module({
  controllers: [AuthController, OTPController],
  providers: [AuthRepository, AuthService, OTPRepository, OTPService, BcryptUtils]
})
export class AuthModule { }
