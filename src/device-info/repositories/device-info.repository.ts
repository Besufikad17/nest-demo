import { Injectable } from "@nestjs/common";
import { IDeviceInfoRepository } from "../interfaces";
import { PrismaService } from "src/prisma/prisma.service";
import { DeviceInfo, Prisma } from "generated/prisma/client";

@Injectable()
export class DeviceInfoRepository implements IDeviceInfoRepository {
    constructor(private prisma: PrismaService) {}

    async createDeviceInfo(createDeviceInfoArgs: Prisma.DeviceInfoCreateArgs): Promise<DeviceInfo> {
        return await this.prisma.deviceInfo.create(createDeviceInfoArgs);
    }
    async findDeviceInfo(findDeviceInfoArgs: Prisma.DeviceInfoFindFirstArgs): Promise<DeviceInfo | null> {
        return await this.prisma.deviceInfo.findFirst(findDeviceInfoArgs);
    }
    async findDeviceInfos(findDeviceInfosArgs: Prisma.DeviceInfoFindManyArgs): Promise<DeviceInfo[]>  {
        return await this.prisma.deviceInfo.findMany(findDeviceInfosArgs);
    }
    async updateDeviceInfo(updateDeviceInfoArgs: Prisma.DeviceInfoUpdateArgs): Promise<DeviceInfo> {
        return await this.prisma.deviceInfo.update(updateDeviceInfoArgs);
    }
    async deleteDeviceInfo(deleteDeviceInfoArgs: Prisma.DeviceInfoDeleteArgs): Promise<void> {
        await this.prisma.deviceInfo.delete(deleteDeviceInfoArgs);
    }
}