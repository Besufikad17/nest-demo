import { OTP } from '@prisma/client';
import { FindOTPDto, GenerateOTPDto, VerifyOTPDto } from '../dto/otp.dto';

export interface IOTPResponse {
  message: string
}

export abstract class IOtpService {
  abstract createOTP(generateOTPDto: GenerateOTPDto, deviceInfo?: string, ip?: string): Promise<IOTPResponse>;
  abstract getOTP(findOTPDto: FindOTPDto, deviceInfo?: string, ip?: string): Promise<OTP | null>;
  abstract resendOTP(generateOTPDto: GenerateOTPDto, deviceInfo?: string, ip?: string): Promise<IOTPResponse>;
  abstract verifyOTP(verifyOTPDto: VerifyOTPDto, deviceInfo?: string, ip?: string): Promise<IOTPResponse>;
}
