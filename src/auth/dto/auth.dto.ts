import { USER_ACCOUNT_STATUS } from "@prisma/client";
import { IsBoolean, IsDate, IsEmail, IsEnum, IsNotEmpty, IsString } from "class-validator";

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

export class UpdateUserDto {
	@IsString()
	readonly firstName?: string;

	@IsString()
	readonly lastName?: string;

	@IsString()
	readonly email?: string;

	@IsString()
	readonly phoneNumber?: string;

	@IsDate()
	readonly lastLogin?: Date;

	@IsBoolean()
	readonly isActive?: boolean;

	@IsEnum(USER_ACCOUNT_STATUS)
	@IsNotEmpty()
	readonly accountStatus?: USER_ACCOUNT_STATUS;
}

export class UpdatePasswordDto {
	@IsNotEmpty()
	@IsString()
	readonly oldPassword: string;

	@IsNotEmpty()
	@IsString()
	readonly newPassword: string;
}
