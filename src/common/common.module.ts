import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { GoogleStrategy, JwtRefreshStrategy, JwtStrategy } from './strategies';
import { JwtGuard, RateLimitGuard } from './guards';
import { UserModule } from 'src/user/user.module';
import { UserRoleModule } from 'src/user-role/user-role.module';
import { RateLimitStore } from './rate-limit/rate-limit.store';
import { RateLimitService } from './rate-limit/rate-limit.service';
import { RateLimitOutcomeInterceptor } from './interceptors/rate-limit-outcome.interceptor';
import { PaginationInterceptor } from './interceptors/pagination.interceptor';

@Module({
  providers: [
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    JwtGuard,
    RateLimitStore,
    RateLimitService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RateLimitOutcomeInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PaginationInterceptor,
    }
  ],
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      useFactory: async (config: ConfigService) => ({
        global: true,
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '60s' },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    UserRoleModule
  ]
})
export class CommonModule { }
