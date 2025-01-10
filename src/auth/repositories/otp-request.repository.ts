import { Injectable } from "@nestjs/common";
import { IOTPRequestRepository } from "../interfaces/otp-request.repository.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { OTPRequests, Prisma } from "@prisma/client";

@Injectable()
export class OTPRequestRepository implements IOTPRequestRepository {
  constructor(private prisma: PrismaService) { }

  async createOTPRequest(createOTPRequestArgs: Prisma.OTPRequestsCreateArgs): Promise<OTPRequests> {
    return await this.prisma.oTPRequests.create(createOTPRequestArgs);
  }

  async getOTPRequest(findOTPRequestArgs: Prisma.OTPRequestsFindUniqueArgs): Promise<OTPRequests | null> {
    return await this.prisma.oTPRequests.findUnique(findOTPRequestArgs);
  }

  async updateOTPRequest(updateOTPRequestArgs: Prisma.OTPRequestsUpdateArgs): Promise<OTPRequests> {
    return await this.prisma.oTPRequests.update(updateOTPRequestArgs);
  }

  async deleteOTPRequest(deleteOTPRequestArgs: Prisma.OTPRequestsDeleteArgs): Promise<any> {
    return await this.prisma.oTPRequests.delete(deleteOTPRequestArgs);
  }
}
