import { Global, Module } from "@nestjs/common";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";
import * as Interface from "./interfaces";
import { UserRepository } from "./repositories/user.repository";
import { DeletedUserRepository } from "./repositories/deleted-user.repository";
import { UserActivityModule } from "src/user-activity/user-activity.module";
import { OtpModule } from "src/otp/otp.module";

@Global()
@Module({
  controllers: [UserController],
  providers: [
    {
      provide: Interface.IUserService,
      useClass: UserService,
    },
    {
      provide: Interface.IUserRepository,
      useClass: UserRepository,
    },
    {
      provide: Interface.IDeletedUserRepository,
      useClass: DeletedUserRepository
    }
  ],
  imports: [
    OtpModule,
    UserActivityModule,
  ],
  exports: [Interface.IDeletedUserRepository, Interface.IUserService, Interface.IUserRepository],
})
export class UserModule { }
