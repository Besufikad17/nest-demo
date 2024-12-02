import { Body, Controller, Post } from "@nestjs/common";
import { SignUpDto } from "../dto/auth.dto";
import { AuthService } from "../services/auth.service";

@Controller('/auth')
export class AuthController {

	constructor(private authService: AuthService) { }

	@Post('/signup')
	async signup(@Body() signUpDto: SignUpDto) {
		return await this.authService.signUp(signUpDto);
	}

}
