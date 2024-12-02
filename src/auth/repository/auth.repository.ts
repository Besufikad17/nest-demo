import { Injectable } from "@nestjs/common";
import { SignUpDto } from "../dto/auth.dto";
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

}
