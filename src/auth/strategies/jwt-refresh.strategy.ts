import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { IUserService } from "src/user/interfaces";
import { Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { ExtractJwt } from "passport-jwt";
import { RoleEnums } from "src/user-role/enums/role.enum";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private userService: IUserService,
    configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const authUser = await this.userService.findUser({ id: payload.sub }, RoleEnums.USER);
    if (!authUser) {
      throw new UnauthorizedException();
    }
    return {
      user: authUser,
      refreshTokenExpiresAt: new Date(payload.exp * 1000),
    };
  }
}
