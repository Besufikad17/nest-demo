import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOTPDto, FindOTPDto, UpdateOTPDto } from "../dto/otp.dto";
import { OTP } from "@prisma/client";
import { IOTPRepository } from "../interfaces";

@Injectable()
export class OTPRepository implements IOTPRepository {
    constructor(private prismaService: PrismaService) { }

    async createOTP(createOTPDto: CreateOTPDto): Promise<OTP> {
        return await this.prismaService.oTP.create({ data: createOTPDto });
    }

    async findOTP(findOTPDto: FindOTPDto): Promise<OTP | null> {
        return await this.prismaService.oTP.findFirst({
            where: {
                OR: [
                    {
                        userId: findOTPDto.userId
                    },
                    {
                        value: findOTPDto.value
                    },
                    {
                        type: findOTPDto.type
                    }
                ]
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }

    async updateOTP(id: string, data: UpdateOTPDto): Promise<OTP> {
        return await this.prismaService.oTP.update({
            where: {
                id: id
            },
            data: {
                ...data
            }
        });
    }

    async deleteOTP(id: string) {
        return await this.prismaService.oTP.delete({
            where: {
                id: id
            }
        });
    }
}
