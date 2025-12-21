import { Module } from "@nestjs/common";
import { RoleRepository } from "./repositories/role.repository";
import { RoleService } from "./services/role.service";
import * as Interface from "./interfaces";

@Module({
  providers: [
    { provide: Interface.IRoleRepository, useClass: RoleRepository },
    { provide: Interface.IRoleService, useClass: RoleService },
    RoleService,
  ],
  exports: [Interface.IRoleRepository, Interface.IRoleService]
})
export class RoleModule { }
