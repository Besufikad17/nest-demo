import { DeviceInfo, Prisma } from "generated/prisma/client";

export abstract class IDeviceInfoRepository {
    abstract createDeviceInfo(createDeviceInfoArgs: Prisma.DeviceInfoCreateArgs): Promise<DeviceInfo>;
    abstract findDeviceInfo(findDeviceInfoArgs: Prisma.DeviceInfoFindFirstArgs): Promise<DeviceInfo | null>;
    abstract findDeviceInfos(findDeviceInfosArgs: Prisma.DeviceInfoFindManyArgs): Promise<DeviceInfo[]>;
    abstract updateDeviceInfo(updateDeviceInfoArgs: Prisma.DeviceInfoUpdateArgs): Promise<DeviceInfo>;
    abstract deleteDeviceInfo(deleteDeviceInfoArgs: Prisma.DeviceInfoDeleteArgs): Promise<void>;
}