import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import * as Interfaces from './interfaces';
import { AuthRepository } from './repositories';
import { UserModule } from 'src/user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GoogleStrategy } from './strategies';
import { OTPController } from './controllers/otp.controller';
import { OTPService } from './services/otp.service';
import { OTPRepository } from './repositories/otp.repository';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { OTPRequestRepository } from './repositories/otp-request.repository';
import { UserTwoStepVerificationModule } from 'src/user-two-step-verification/user-two-step-verification.module';
import { UserSsoModule } from 'src/user-sso/user-sso.module';
import { UserActivityModule } from 'src/user-activity/user-activity.module';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';

@Module({
  providers: [
    { provide: Interfaces.IAuthService, useClass: AuthService },
    { provide: Interfaces.IAuthRepository, useClass: AuthRepository },
    { provide: Interfaces.IOtpRepository, useClass: OTPRepository },
    { provide: Interfaces.IOtpService, useClass: OTPService },
    { provide: Interfaces.IOTPRequestRepository, useClass: OTPRequestRepository },
    { provide: Interfaces.IRefreshTokenRepository, useClass: RefreshTokenRepository },
    OTPRepository,
    OTPRequestRepository,
    OTPService,
    RefreshTokenRepository,
    GoogleStrategy,
    JwtStrategy
  ],
  controllers: [AuthController, OTPController],
  imports: [
    UserModule,
    UserSsoModule,
    UserTwoStepVerificationModule,
    ConfigModule,
    UserActivityModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        global: true,
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    })
  ],
})
export class AuthModule { }
