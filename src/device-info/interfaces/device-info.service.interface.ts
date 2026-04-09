import { DeviceInfo } from "generated/prisma/client";
import { CreateDeviceInfoDto, GetDeviceInfoDto, UpdateDeviceInfoDto } from "../dto/device-info.dto";
import { IApiResponse } from "src/common/interfaces";

export abstract class IDeviceInfoService {
    abstract createDeviceInfo(createDeviceInfoDto: CreateDeviceInfoDto): Promise<DeviceInfo>;
    abstract getDeviceInfo(getDeviceInfoDto: GetDeviceInfoDto): Promise<DeviceInfo | null>;
    abstract getSessions(userId: string): Promise<IApiResponse<DeviceInfo[]>>;
    abstract updateDeviceInfo(updateDeviceInfoDto: UpdateDeviceInfoDto): Promise<DeviceInfo>;
}
