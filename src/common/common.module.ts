import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtRefreshStrategy, JwtStrategy } from './strategies';
import { JwtGuard } from './guards';
import { UserModule } from 'src/user/user.module';
import { UserRoleModule } from 'src/user-role/user-role.module';

@Module({
  providers: [JwtStrategy, JwtRefreshStrategy, JwtGuard],
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
