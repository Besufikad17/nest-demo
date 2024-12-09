import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { LoginDto, RecoverAccountDto, SignUpDto, UpdatePasswordDto } from "../dto/auth.dto";
import { IAuthResponse, IAuthService } from "../interfaces/auth.service.interface";
import { OTPService } from "./otp.services";
import { BcryptUtils } from "../utils/bcrypt";
import { IUserService } from "src/user/interfaces";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService implements IAuthService {
	constructor(private userService: IUserService, private otpService: OTPService, private bcryptUtils: BcryptUtils) { }

	async signUp(signUpDto: SignUpDto): Promise<IAuthResponse> {
		try {
			const { password, rememberMe, ...userWithoutPassword } = signUpDto;

			let hashedPassword: string = await this.bcryptUtils.hash(password);
			const newUser = await this.userService.createUser({ passwordHash: hashedPassword, ...userWithoutPassword });

			this.otpService.createOTP({ userId: newUser.id, activity: "ACCOUNT_VERIFICATION", identifier: "EMAIL" });

			const token = jwt.sign({
				id: newUser.id,
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
			const user = await this.userService.findUser({ email: loginDto.loginText, phoneNumber: loginDto.loginText });

			if (!user) {
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			}

			const isPasswordMatched = await this.bcryptUtils.compare(loginDto.password, user.passwordHash);
			if (isPasswordMatched) {
				if (user.twoStepEnabled) {
					await this.otpService.createOTP({ userId: user.id, activity: "TWO_FACTOR_AUTHENTICATION", identifier: "EMAIL" });
					return { message: "Verification code sent!!" };
				} else {
					await this.userService.updateUser(user.id, { lastLogin: new Date() });
					const token = jwt.sign({
						id: user.id,
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

	async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto): Promise<IAuthResponse> {
		try {
			const otp = await this.otpService.getOTP({ userId: userId, activity: "PASSWORD_RESET", identifier: "EMAIL" });

			let yesterday = new Date();
			yesterday.setDate(yesterday.getDay() + 1);
			if (otp) {
				if (otp.status === "VERIFIED" && otp.updatedAt <= yesterday) {
					const user = await this.userService.findUser({ id: userId });
					const passowordMatch = await this.bcryptUtils.compare(updatePasswordDto.oldPassword, user.passwordHash);
					if (passowordMatch) {
						const hashed = await this.bcryptUtils.hash(updatePasswordDto.newPassword);
						await this.userService.updateUser(userId, { passwordHash: hashed });
						return { message: "Password updated" };
					} else {
						throw new HttpException("Invalid credentials!!", HttpStatus.BAD_REQUEST);
					}
				}
			} else {
				throw new HttpException("Action verification required!!", HttpStatus.BAD_REQUEST);
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

	async recoverAccount(recoverAccountDto: RecoverAccountDto): Promise<IAuthResponse> {
		try {
			const user = await this.userService.findUser({ email: recoverAccountDto.loginText, phoneNumber: recoverAccountDto.loginText });
			if (user) {
				await this.otpService.createOTP({ userId: user.id, activity: "ACCOUNT_RECOVERY", identifier: "EMAIL" });
				return { message: "OTP sent" };
			} else {
				throw new HttpException("User not found!!", HttpStatus.BAD_REQUEST);
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
