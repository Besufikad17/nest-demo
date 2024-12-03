import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { LoginDto, SignUpDto } from "../dto/auth.dto";
import { AuthRepository } from "../repository/auth.repository";
import { IAuthResponse } from "../interfaces/auth.interface";
import { OTPService } from "./otp.services";
import * as jwt from "jsonwebtoken";
import { BcryptUtils } from "../utils/bcrypt";

@Injectable()
export class AuthService {

	constructor(private authRepository: AuthRepository, private otpService: OTPService, private bcryptUtils: BcryptUtils) { }

	async signUp(signUpDto: SignUpDto): Promise<IAuthResponse> {
		try {
			const { password, rememberMe, ...userWithoutPassword } = signUpDto;

			let hashedPassword: string = await this.bcryptUtils.hash(password);
			const newUser = await this.authRepository.createUser({ passwordHash: hashedPassword, ...userWithoutPassword });

			this.otpService.createOTP({ userId: newUser.id, activity: "ACCOUNT_VERIFICATION", identifier: "EMAIL" });

			const token = jwt.sign({
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				email: newUser.email,
			}, process.env.JWT_SECRET, {
				expiresIn: rememberMe ? '7 days' : '24h',
			});

			return { message: 'User registered successfully', token: token };
		} catch (error) {
			console.log(error);
			if (error instanceof HttpException) {
				throw new HttpException(error, HttpStatus.BAD_REQUEST);
			} else if (error.code === 'P2002') {
				throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
			} else {
				throw new HttpException(
					error.meta || 'Error occurred check the log in the server',
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}

	async login(loginDto: LoginDto): Promise<IAuthResponse> {
		try {
			const user = await this.authRepository.findUserByEmailOrPhoneNumber(loginDto.loginText);

			if (!user) {
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			}

			const isPasswordMatched = await this.bcryptUtils.compare(loginDto.password, user.passwordHash);
			if (isPasswordMatched) {
				if (user.twoStepEnabled) {
					await this.otpService.createOTP({ userId: user.id, activity: "TWO_FACTOR_AUTHENTICATION", identifier: "EMAIL" });
					return { message: "Verification code sent!!" };
				} else {
					await this.authRepository.updateUser(user.id, { lastLogin: new Date() });
					const token = jwt.sign({
						firstName: user.firstName,
						lastName: user.lastName,
						email: user.email,
					}, process.env.JWT_SECRET, {
						expiresIn: loginDto.rememberMe ? '7 days' : '24h',
					});

					return { message: 'User logged in successfully', token: token };
				}
			} else {
				throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
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
