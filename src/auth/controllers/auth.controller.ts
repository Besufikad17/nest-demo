import { Body, Controller, Post, Req } from "@nestjs/common";
import { LoginDto, SignUpDto, UpdatePasswordDto } from "../dto/auth.dto";
import { AuthService } from "../services/auth.service";
import { Request } from "express";

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

	@Post('/update-password')
	async updatePassword(@Body() updatePasswordDto: UpdatePasswordDto, @Req() request: Request) {
		return await this.authService.updatePassword(request['user'].userId, updatePasswordDto);
	}
}
