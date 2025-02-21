import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import * as Joi from "joi";
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { UserActivityModule } from './user-activity/user-activity.module';
import { UserSsoModule } from './user-sso/user-sso.module';
import { UserTwoStepVerificationModule } from './user-two-step-verification/user-two-step-verification.module';
import { WebAuthnCredentialModule } from './web-authn-credential/web-authn-credential.module';
import { NotificationSettingsModule } from './notification-settings/notification-settings.module';
import { OtpModule } from './otp/otp.module';
import { OtpRequestModule } from './otp-request/otp-request.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        FIREBASE_APPLICATION_TYPE: Joi.string().required(),
        FIREBASE_PROJECT_ID: Joi.string().required(),
        FIREBASE_PRIVATE_ID: Joi.string().required(),
        FIREBASE_PRIVATE_KEY: Joi.string().required(),
        FIREBASE_CLIENT_EMAIL: Joi.string().required(),
        FIREBASE_CLIENT_ID: Joi.string().required(),
        FIREBASE_AUTH_URI: Joi.string().required(),
        FIREBASE_TOKEN_URI: Joi.string().required(),
        FIREBASE_AUTH_CERT_URL: Joi.string().required(),
        FIREBASE_CLIENT_CERT_URL: Joi.string().required(),
        FIREBASE_UNIVERSE_DOMAIN: Joi.string().required(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        GOOGLE_CALLBACK_URL: Joi.string(),
        JWT_SECRET: Joi.string().required(),
        MAIL_HOST: Joi.string().required(),
        MAIL_PORT: Joi.number().required(),
        MAIL_SECURE: Joi.bool().required(),
        MAIL_USER: Joi.string().required(),
        MAIL_PASS: Joi.string().required(),
        MAIL_FROM: Joi.string().required(),
        PORT: Joi.number().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_HOST: Joi.string().required()
      }),
    }),
    NotificationSettingsModule,
    PrismaModule,
    RoleModule,
    UserModule,
    UserActivityModule,
    UserSsoModule,
    UserTwoStepVerificationModule,
    WebAuthnCredentialModule,
    OtpModule,
    OtpRequestModule,
    NotificationModule
  ],
})
export class AppModule { }
