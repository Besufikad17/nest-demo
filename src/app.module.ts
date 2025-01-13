import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import * as Joi from "joi";
import { AuthMiddleware } from './middleware/auth.middleware';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { UserActivityModule } from './user-activity/user-activity.module';
import { UserSsoModule } from './user-sso/user-sso.module';
import { UserTwoStepVerificationModule } from './user-two-step-verification/user-two-step-verification.module';
import { WebAuthnCredentialModule } from './web-authn-credential/web-authn-credential.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string(),
        JWT_SECRET: Joi.string().required(),
        PORT: Joi.number().required()
      }),
    }),
    NotificationSettingsModule,
    PrismaModule,
    RoleModule,
    UserModule,
    UserActivityModule,
    UserSsoModule,
    UserTwoStepVerificationModule,
    WebAuthnCredentialModule
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('/auth/update-password')
  }
}
