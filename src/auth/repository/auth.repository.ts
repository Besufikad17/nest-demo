import { Injectable } from "@nestjs/common";
import { UpdateUserDto } from "../dto/auth.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { IUser } from "../interfaces/auth.interface";
import { User } from "@prisma/client";

@Injectable()
export class AuthRepository {

	constructor(private prismaService: PrismaService) {

	}

	async createUser(newUser: IUser): Promise<User> {
		return await this.prismaService.user.create({ data: newUser });
	}

	async findUser(id: string): Promise<User> {
		return await this.prismaService.user.findFirst({ where: { id: id } });
	}

	async findUserByEmailOrPhoneNumber(loginText: string): Promise<User> {
		return await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ email: loginText },
					{ phoneNumber: loginText }
				]
			}
		});
	}

	async updateUser(userId: string, data: UpdateUserDto) {
		return await this.prismaService.user.update({
			where: {
				id: userId
			},
			data: {
				...data
			}
		});
	}
}
