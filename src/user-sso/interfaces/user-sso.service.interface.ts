import { UserSSO } from "generated/prisma/client";
import { CreateUserSSODto, FindUserSSODto } from "../dto/user-sso.dto";

export abstract class IUserSSOService {
  abstract createUserSSO(createUserSSODto: CreateUserSSODto): Promise<UserSSO>;
  abstract findUserSSO(findUserSSODto: FindUserSSODto): Promise<UserSSO | null>;
}
