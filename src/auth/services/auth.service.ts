import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { LoginDto, SignUpDto } from "../dto/auth.dto";
import { AuthRepository } from "../repository/auth.repository";
import * as jwt from "jsonwebtoken";
import * as bcrypt from 'bcryptjs';
import { ILoginResponse, ISignUpResponse } from "../interfaces/auth.interface";

@Injectable()
export class AuthService {

	constructor(private authRepository: AuthRepository) { }

	async signUp(signUpDto: SignUpDto): Promise<ISignUpResponse> {
		try {
			const { password, rememberMe, ...userWithoutPassword } = signUpDto;

			let salt: string = await bcrypt.genSalt(10);
			let hashedPassword: string = await bcrypt.hash(password, salt);
			const newUser = await this.authRepository.createUser({ passwordHash: hashedPassword, ...userWithoutPassword });

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
			} else if(error.code === 'P2002') {
				throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
			} else {
				throw new HttpException(
					error.meta || 'Error occurred check the log in the server',
					HttpStatus.INTERNAL_SERVER_ERROR,
				);
			}
		}
	}

	async login(loginDto: LoginDto): Promise<ILoginResponse> {
		try {
			const user = await this.authRepository.findUserByEmailOrPhoneNumber(loginDto.loginText);

			if(!user) {
				throw new HttpException('User not found', HttpStatus.NOT_FOUND);
			}

			const isPasswordMatched = await bcrypt.compare(loginDto.password, user.passwordHash);
			if(isPasswordMatched) {
				await this.authRepository.updateLastLogin(user.id);
				const token = jwt.sign({
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
				}, process.env.JWT_SECRET, {
					expiresIn: loginDto.rememberMe ? '7 days' : '24h',
				});
	
				return { message: 'User logged in successfully', token: token };
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
