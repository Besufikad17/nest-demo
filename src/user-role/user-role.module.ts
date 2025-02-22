import { Module } from '@nestjs/common';
import { UserRoleRepository } from './repositories/user-role.repository';
import { UserRoleService } from './services/user-role.service';
import { UserRoleController } from './controllers/user-role.controller';
import * as Interface from './interfaces';
import { RoleModule } from 'src/role/role.module';

@Module({
  providers: [
    { provide: Interface.IUserRoleRepository, useClass: UserRoleRepository },
    { provide: Interface.IUserRoleService, useClass: UserRoleService },
    UserRoleService,
  ],
  exports: [Interface.IUserRoleRepository, Interface.IUserRoleService],
  controllers: [UserRoleController],
  imports: [RoleModule]
})
export class UserRoleModule { }
