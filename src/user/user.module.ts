import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import * as Interfaces from './interfaces';
import { UserRepository } from './repository/user.repository';

@Module({
  controllers: [UserController],
  providers: [
    { provide: Interfaces.IUserRepository, useClass: UserRepository },
    { provide: Interfaces.IUserService, useClass: UserService },
    UserRepository,
    UserService,
  ],
  exports: [Interfaces.IUserRepository, Interfaces.IUserService]
})
export class UserModule { }
