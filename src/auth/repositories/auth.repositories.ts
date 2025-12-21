import { Injectable } from "@nestjs/common";
import { IAuthRepository } from "../interfaces";

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor() {}
}
