import { Body, Controller, Post } from "@nestjs/common";
import { OTPService } from "../services/otp.services";
import { VerifyOTPDto } from "../dto/otp.dto";

@Controller('/auth')
export class OTPController {
	constructor(private otpService: OTPService) { }

	@Post('/resend-otp')
	async resendOTP() {

	}

	@Post('/verify-otp')
	async verifyOTP(@Body() verifyOTPDto: VerifyOTPDto) {
		return await this.otpService.verifyOtp(verifyOTPDto);
	}
}
