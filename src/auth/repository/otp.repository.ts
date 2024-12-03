import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateOTPDto, UpdateOTPDto } from "../dto/otp.dto";
import { OTP_ACTIVITY } from "@prisma/client";

@Injectable()
export class OTPRepository {
    constructor(private prismaService: PrismaService) { }

    async createOTP(data: CreateOTPDto) {
        return await this.prismaService.oTP.create({ data });
    }

    async getOTP(userId: string, activity: OTP_ACTIVITY) {
        return await this.prismaService.oTP.findFirst({
            where: {
                AND: [
                    {
                        userId: userId
                    },
                    {
                        activity: activity
                    }
                ]
            },
            orderBy: {
                createdAt: "desc"
            }
        });
    }

    async updateOTP(id: string, data: UpdateOTPDto) {
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
