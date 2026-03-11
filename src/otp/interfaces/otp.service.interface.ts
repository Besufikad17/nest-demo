import { OTP } from "generated/prisma/client"
import { FindOtpDto, GenerateOtpDto, VerifyOtpDto } from "../dto/otp.dto";
import { IDeviceInfo } from "src/common/interfaces";

export interface IOTPResponse {
  message: string
}

export abstract class IOtpService {
  abstract createOTP(generateOTPDto: GenerateOtpDto, deviceInfo?: IDeviceInfo, ip?: string): Promise<IOTPResponse>;
  abstract getOTP(findOTPDto: FindOtpDto, deviceInfo?: IDeviceInfo, ip?: string): Promise<OTP | null>;
  abstract resendOTP(generateOTPDto: GenerateOtpDto, deviceInfo?: IDeviceInfo, ip?: string): Promise<IOTPResponse>;
  abstract verifyOTP(verifyOTPDto: VerifyOtpDto, deviceInfo?: IDeviceInfo, ip?: string): Promise<IOTPResponse>;
}
