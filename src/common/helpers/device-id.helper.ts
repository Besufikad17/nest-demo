import { DeviceType } from "generated/prisma/enums";
import { IDeviceInfo } from "../interfaces";
import { IDeviceInfoService } from "src/device-info/interfaces";

export interface AddOrGetDeviceIdResponse {
    deviceId: string;
    isNew: boolean;
}

export async function addOrGetDeviceId(
    deviceInfoService: IDeviceInfoService,
    deviceInfo: IDeviceInfo,
    userId: string,
    ip: string
): Promise<AddOrGetDeviceIdResponse> {
    const { device, type, ...deviceInfoDetails } = deviceInfo;
    const deviceType = type === "desktop" ? DeviceType.DESKTOP :
        type === "mobile" ? DeviceType.MOBILE :
            type === "tablet" ? DeviceType.TABLET : DeviceType.OTHER

    let deviceId: string;
    let isNew = false;
    const deviceInfoInDb = await deviceInfoService.getDeviceInfo({
        userId,
        ...deviceInfoDetails,
        ipAddress: ip
    });

    if (deviceInfoInDb) {
        deviceId = deviceInfoInDb.id;

        await deviceInfoService.updateDeviceInfo({
            id: deviceId,
            lastActiveAt: new Date()
        });
    } else {
        const newDeviceInfo = await deviceInfoService.createDeviceInfo({
            userId,
            ...deviceInfoDetails,
            name: device,
            ipAddress: ip,
            lastActiveAt: new Date(),
            type: deviceType
        });
        deviceId = newDeviceInfo.id;
        isNew = true;
    }
    return { deviceId, isNew };
}
