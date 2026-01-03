import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { IUser } from "src/common/interfaces";

@Injectable()
export class JwtGuard extends AuthGuard("jwt") {
  constructor() {
    super();
  }

  handleRequest<TUser = IUser>(err: Error, user: TUser): TUser {
    if (err || !user || !(user as unknown as IUser)) {
      throw new UnauthorizedException("Unauthorized");
    }
    return user;
  }
}
