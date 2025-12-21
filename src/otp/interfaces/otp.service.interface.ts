import { OTP } from "generated/prisma/client"
import { FindOtpDto, GenerateOtpDto, VerifyOtpDto } from "../dto/otp.dto";

export interface IOTPResponse {
  message: string
}

export abstract class IOtpService {
  abstract createOTP(generateOTPDto: GenerateOtpDto, deviceInfo?: string, ip?: string): Promise<IOTPResponse>;
  abstract getOTP(findOTPDto: FindOtpDto, deviceInfo?: string, ip?: string): Promise<OTP | null>;
  abstract resendOTP(generateOTPDto: GenerateOtpDto, deviceInfo?: string, ip?: string): Promise<IOTPResponse>;
  abstract verifyOTP(verifyOTPDto: VerifyOtpDto, deviceInfo?: string, ip?: string): Promise<IOTPResponse>;
}
