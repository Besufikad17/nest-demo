import { OTP } from "@prisma/client";
import { FindOTPDto, GenerateOTPDto, VerifyOTPDto } from "../dto/otp.dto";

export interface IOTPResponse {
    message: string;
}

export abstract class IOTPService {
    abstract createOTP(generateOTPDto: GenerateOTPDto): Promise<IOTPResponse>;
    abstract findOTP(findOTPDto: FindOTPDto): Promise<OTP | null>;
    abstract resendOTP(generateOTPDto: GenerateOTPDto): Promise<IOTPResponse>;
    abstract verifyOTP(verifyOTP: VerifyOTPDto): Promise<IOTPResponse>;
}
