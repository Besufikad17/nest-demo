import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { SignUpDto } from "../dto/auth.dto";
import { AuthRepository } from "../repository/auth.repository";
import * as jwt from "jsonwebtoken";
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {

	constructor(private authRepository: AuthRepository) { }

	async signUp(signUpDto: SignUpDto) {
		try {
			const { password, ...userWithoutPassword } = signUpDto;

			let salt: string = await bcrypt.genSalt(10);
			let hashedPassword: string = await bcrypt.hash(password, salt);
			const newUser = await this.authRepository.createUser({ passwordHash: hashedPassword, ...userWithoutPassword });

			const token = jwt.sign({
				firstName: newUser.firstName,
				lastName: newUser.lastName,
				email: newUser.email,
			}, process.env.JWT_SECRET, {
				expiresIn: '24h',
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
}
