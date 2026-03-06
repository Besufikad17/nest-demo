import { DeviceInfo } from "generated/prisma/client";
import { CreateDeviceInfoDto, GetDeviceInfoDto, UpdateDeviceInfoDto } from "../dto/device-info.dto";

export abstract class IDeviceInfoService {
    abstract createDeviceInfo(createDeviceInfoDto: CreateDeviceInfoDto): Promise<DeviceInfo>;
    abstract getDeviceInfo(getDeviceInfoDto: GetDeviceInfoDto): Promise<DeviceInfo | null>;
    abstract updateDeviceInfo(updateDeviceInfoDto: UpdateDeviceInfoDto): Promise<DeviceInfo>;
}