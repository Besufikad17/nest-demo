import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { OTPRepository } from "../repository/otp.repository";
import { GenerateOTPDto, VerifyOTPDto } from "../dto/otp.dto";
import * as bcrypt from "bcryptjs";
import { AuthRepository } from "../repository/auth.repository";
import { IOTPResponse } from "../interfaces/auth.interface";
import { BcryptUtils } from "../utils/bcrypt";

@Injectable()
export class OTPService {
	constructor(private otpRepository: OTPRepository, private authRepository: AuthRepository, private bcryptUtils: BcryptUtils) { }

	async createOTP(generateOtpDto: GenerateOTPDto): Promise<IOTPResponse> {
		try {
			let value: string = `${Math.floor(100000 + Math.random() * 900000)}`;
			let otpCode: string = await this.bcryptUtils.hash(value);
			await this.otpRepository.createOTP({
				...generateOtpDto,
				value: value,
				otpCode: otpCode
			});
			return { message: "Verification code sent" };
		} catch (error) {
			console.log(error);
			if (error instanceof HttpException) {
				throw new HttpException(error, HttpStatus.BAD_REQUEST);
			} else {
				throw new HttpException(
					error.meta || 'Error occurred check the log in the server',
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}

	async resendOTP(generateOTPDto: GenerateOTPDto): Promise<IOTPResponse> {
		try {
			const otp = await this.otpRepository.getOTP(generateOTPDto.userId, generateOTPDto.activity);

			if (otp) {
				await this.otpRepository.deleteOTP(otp.id);
			}

			return await this.createOTP(generateOTPDto);
		} catch (error) {
			console.log(error);
			if (error instanceof HttpException) {
				throw new HttpException(error, HttpStatus.BAD_REQUEST);
			} else {
				throw new HttpException(
					error.meta || 'Error occurred check the log in the server',
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}

	}

	async verifyOtp(verifyOtpDto: VerifyOTPDto): Promise<IOTPResponse> {
		try {
			const otp = await this.otpRepository.getOTP(verifyOtpDto.userId, verifyOtpDto.activity);

			if (!otp) {
				throw new HttpException("Invalid code!!", HttpStatus.BAD_REQUEST);
			}

			if (otp.attempts > 0) {
				let otpMatch: boolean = await bcrypt.compare(verifyOtpDto.value, otp.otpCode);

				if (otpMatch) {
					console.log(otp.status);
					if (otp.status === "PENDING") {
						const user = await this.authRepository.findUser(otp.userId);
						if (otp.activity === "ACCOUNT_VERIFICATION" && !user.isActive && user.accountStatus !== "ACTIVE") {
							await this.authRepository.updateUser(otp.userId, {
								isActive: true,
								accountStatus: "ACTIVE"
							});
						}
						await this.otpRepository.updateOTP(otp.id, { status: "VERIFIED" });
						return { message: "Verification completed" };
					} else {
						throw new HttpException(`OTP has ${otp.status.toLowerCase()}!!`, HttpStatus.BAD_REQUEST);
					}
				} else {
					await this.otpRepository.updateOTP(otp.id, { attempts: otp.attempts - 1 });
					throw new HttpException("Invalid code!!", HttpStatus.BAD_REQUEST);
				}
			} else {
				throw new HttpException("You have reached maximum trial!!", HttpStatus.BAD_REQUEST);
			}
		} catch (error) {
			console.log(error);
			if (error instanceof HttpException) {
				throw new HttpException(error, HttpStatus.BAD_REQUEST);
			} else {
				throw new HttpException(
					error.meta || 'Error occurred check the log in the server',
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}
}
