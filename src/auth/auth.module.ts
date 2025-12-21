import { Module } from "@nestjs/common";
import { AuthService } from "./services/auth.service";
import { AuthController } from "./controllers/auth.controller";
import * as Interfaces from "./interfaces";
import { AuthRepository } from "./repositories";
import { UserModule } from "src/user/user.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { GoogleStrategy } from "./strategies";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { UserTwoStepVerificationModule } from "src/user-two-step-verification/user-two-step-verification.module";
import { UserSsoModule } from "src/user-sso/user-sso.module";
import { UserActivityModule } from "src/user-activity/user-activity.module";
import { RefreshTokenRepository } from "./repositories/refresh-token.repository";
import { RoleModule } from "src/role/role.module";
import { UserRoleModule } from "src/user-role/user-role.module";
import { NotificationSettingsModule } from "src/notification-settings/notification-settings.module";
import { OtpModule } from "src/otp/otp.module";
import { NotificationModule } from "src/notification/notification.module";

@Module({
  providers: [
    { provide: Interfaces.IAuthService, useClass: AuthService },
    { provide: Interfaces.IAuthRepository, useClass: AuthRepository },
    { provide: Interfaces.IRefreshTokenRepository, useClass: RefreshTokenRepository },
    RefreshTokenRepository,
    GoogleStrategy,
    JwtStrategy
  ],
  controllers: [AuthController],
  imports: [
    UserModule,
    UserSsoModule,
    UserTwoStepVerificationModule,
    ConfigModule,
    UserActivityModule,
    RoleModule,
    UserRoleModule,
    NotificationModule,
    NotificationSettingsModule,
    OtpModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        global: true,
        secret: config.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "60s" },
      }),
      inject: [ConfigService],
    })
  ],
})
export class AuthModule { }
