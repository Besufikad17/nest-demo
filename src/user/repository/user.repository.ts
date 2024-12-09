import { Injectable } from "@nestjs/common";
import { CreateUserDto, FindUserDto, UpdateUserDto } from "../dto/user.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { User } from "@prisma/client";
import { IUserRepository } from "../interfaces";

@Injectable()
export class UserRepository implements IUserRepository {

	constructor(private prismaService: PrismaService) { }

	async createUser(createUserDto: CreateUserDto): Promise<User> {
		return await this.prismaService.user.create({ data: createUserDto });
	}

	async findUser(findUserDto: FindUserDto): Promise<User | null> {
		return await this.prismaService.user.findFirst({
			where: {
				OR: [
					{ id: findUserDto.id },
					{ email: findUserDto.email },
					{ phoneNumber: findUserDto.phoneNumber }
				]
			}
		});
	}

	async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
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
