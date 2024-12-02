import { IsEmail, IsNotEmpty } from "class-validator";

export class SignUpDto {
	@IsNotEmpty()
	readonly firstName: string;

	@IsNotEmpty()
	readonly lastName: string;

	@IsEmail()
	@IsNotEmpty()
	readonly email: string;

	@IsNotEmpty()
	readonly phoneNumber: string;

	@IsNotEmpty()
	readonly password: string;

	@IsNotEmpty()
	readonly rememberMe: boolean;
}

export class LoginDto {
	@IsNotEmpty()
	readonly loginText: string;

	@IsNotEmpty()
	readonly password: string;

	@IsNotEmpty()
	readonly rememberMe: boolean;
}