import { OTP, Prisma } from "generated/prisma/client"

export abstract class IOtpRepository {
  abstract createOTP(createOTPArgs: Prisma.OTPCreateArgs): Promise<OTP>;
  abstract getOTP(findOTPDArgs: Prisma.OTPFindFirstArgs): Promise<OTP | null>;
  abstract updateOTP(updateOTPArgs: Prisma.OTPUpdateArgs): Promise<OTP>;
  abstract deleteOTP(deleteOTPArgs: Prisma.OTPDeleteArgs): Promise<any>;
}
