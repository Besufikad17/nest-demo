import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { IOtpRepository } from "../interfaces";
import { Prisma } from "@prisma/client";

@Injectable()
export class OtpRepository implements IOtpRepository {
  constructor(private prismaService: PrismaService) { }

  async createOTP(createOTPArgs: Prisma.OTPCreateArgs) {
    return await this.prismaService.oTP.create(createOTPArgs);
  }

  async getOTP(findOTPArgs: Prisma.OTPFindFirstArgs) {
    return await this.prismaService.oTP.findFirst(findOTPArgs);
  }

  async updateOTP(updateOTPArgs: Prisma.OTPUpdateArgs) {
    return await this.prismaService.oTP.update(updateOTPArgs);
  }

  async deleteOTP(deleteOTPArgs: Prisma.OTPDeleteArgs) {
    return await this.prismaService.oTP.delete(deleteOTPArgs);
  }
}
