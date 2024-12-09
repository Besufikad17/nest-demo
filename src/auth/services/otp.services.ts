import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { FindOTPDto, GenerateOTPDto, VerifyOTPDto } from "../dto/otp.dto";
import { BcryptUtils } from "../utils/bcrypt";
import { OTP } from "@prisma/client";
import { IOTPRepository, IOTPResponse, IOTPService } from "../interfaces";

@Injectable()
export class OTPService implements IOTPService {
	constructor(private otpRepository: IOTPRepository, private bcryptUtils: BcryptUtils) { }

	async createOTP(generateOtpDto: GenerateOTPDto): Promise<IOTPResponse> {
		try {
			let value: string = `${Math.floor(100000 + Math.random() * 900000)}`;
			let otpCode: string = await this.bcryptUtils.hash(value);
			var expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 1);

			await this.otpRepository.createOTP({
				...generateOtpDto,
				otpCode: otpCode,
				expiresAt: expiresAt
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

	async findOTP(findOTPDto: FindOTPDto): Promise<OTP> {
		try {
			return await this.otpRepository.findOTP(findOTPDto);
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
			const otp = await this.findOTP({ ...generateOTPDto });

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

	async verifyOTP(verifyOtpDto: VerifyOTPDto): Promise<IOTPResponse> {
		try {
			const otp = await this.otpRepository.findOTP({
				value: verifyOtpDto.value,
				type: verifyOtpDto.type
			});

			if (!otp) {
				throw new HttpException("Invalid code!!", HttpStatus.BAD_REQUEST);
			}

			if (otp.attempts > 0) {
				if (otp.expiresAt > new Date()) {
					let otpMatch: boolean = await this.bcryptUtils.compare(verifyOtpDto.otpCode, otp.otpCode);

					if (otpMatch) {
						if (otp.status === "PENDING") {
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
					await this.otpRepository.updateOTP(otp.id, { status: "EXPIRED" });
					throw new HttpException("OTP expired!!", HttpStatus.BAD_REQUEST);
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
