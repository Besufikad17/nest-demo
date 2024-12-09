import { OTP } from "@prisma/client";
import { CreateOTPDto, FindOTPDto, UpdateOTPDto } from "../dto/otp.dto";

export abstract class IOTPRepository {
    abstract createOTP(createOTPDto: CreateOTPDto): Promise<OTP>;
    abstract findOTP(findOTPDto: FindOTPDto): Promise<OTP | null>;
    abstract updateOTP(id: string, updateOTPDto: UpdateOTPDto): Promise<OTP>;
    abstract deleteOTP(id: string): Promise<any>;
}
