import { OTP } from "generated/prisma/client"
import { FindOtpDto, GenerateOtpDto, VerifyOtpDto } from "../dto/otp.dto";
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";

export abstract class IOtpService {
  abstract createOTP(generateOTPDto: GenerateOtpDto, deviceInfo?: IDeviceInfo, ip?: string): Promise<IApiResponse<null>>;
  abstract getOTP(findOTPDto: FindOtpDto, deviceInfo?: IDeviceInfo, ip?: string): Promise<OTP | null>;
  abstract resendOTP(generateOTPDto: GenerateOtpDto, deviceInfo?: IDeviceInfo, ip?: string): Promise<IApiResponse<null>>;
  abstract verifyOTP(verifyOTPDto: VerifyOtpDto, deviceInfo?: IDeviceInfo, ip?: string): Promise<IApiResponse<null>>;
}
