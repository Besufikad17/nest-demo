import { OTPRequests, Prisma } from "generated/prisma/client";

export abstract class IOtpRequestService {
  abstract createOTPRequest(createOTPRequestArgs: Prisma.OTPRequestsCreateArgs): Promise<OTPRequests>;
  abstract getOTPRequest(getOTPRequestArgs: Prisma.OTPRequestsFindUniqueArgs): Promise<OTPRequests>;
  abstract updateOTPRequest(updateOTPRequestArgs: Prisma.OTPRequestsUpdateArgs): Promise<OTPRequests>;
} 
