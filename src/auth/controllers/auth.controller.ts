import { Body, Controller, Post } from "@nestjs/common";
import { LoginDto, SignUpDto } from "../dto/auth.dto";
import { AuthService } from "../services/auth.service";

@Controller('/auth')
export class AuthController {

	constructor(private authService: AuthService) { }

	@Post('/signup')
	async signup(@Body() signUpDto: SignUpDto) {
		return await this.authService.signUp(signUpDto);
	}

	@Post('/login')
	async login(@Body() loginDto: LoginDto) {
		return await this.authService.login(loginDto);
	}
}
