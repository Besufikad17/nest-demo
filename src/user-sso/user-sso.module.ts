import { Module } from "@nestjs/common";
import { UserSsoService } from "./services/user-sso.service";
import { UserSsoController } from "./controllers/user-sso.controller";
import * as Interfaces from "./interfaces";
import { UserSSORepository } from "./repositories/user-sso.repository";

@Module({
  providers: [
    { provide: Interfaces.IUserSSORepository, useClass: UserSSORepository },
    { provide: Interfaces.IUserSSOService, useClass: UserSsoService },
    UserSSORepository,
    UserSsoService
  ],
  controllers: [UserSsoController],
  exports: [Interfaces.IUserSSORepository, Interfaces.IUserSSOService]
})
export class UserSsoModule { }
