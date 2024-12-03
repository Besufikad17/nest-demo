import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";

Injectable()
export class BcryptUtils {
  async hash(data: string): Promise<string> {
    let salt: string = await bcrypt.genSalt(10);
    return await bcrypt.hash(data, salt);
  }

  async compare(original: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(original, hashed);
  }
}
