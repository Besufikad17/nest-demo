import { OTPRequests, Prisma } from "@prisma/client";

export abstract class IOtpRequestRepository {
  abstract createOTPRequest(createOTPRequestArgs: Prisma.OTPRequestsCreateArgs): Promise<OTPRequests>;
  abstract getOTPRequest(findOTPRequestArgs: Prisma.OTPRequestsFindUniqueArgs): Promise<OTPRequests | null>;
  abstract updateOTPRequest(updateOTPRequestArgs: Prisma.OTPRequestsUpdateArgs): Promise<OTPRequests>;
  abstract deleteOTPRequest(deleteOTPRequestArgs: Prisma.OTPRequestsDeleteArgs): Promise<any>;
}
