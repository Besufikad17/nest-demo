import { DeviceType } from "generated/prisma/enums";
import { IDeviceInfo } from "../interfaces";
import { IDeviceInfoService } from "src/device-info/interfaces";

export async function addOrGetDeviceId(
    deviceInfoService: IDeviceInfoService,
    deviceInfo: IDeviceInfo,
    userId: string,
    ip: string
): Promise<string> {
    const { device, browserVersion, type, ...deviceInfoDetails } = deviceInfo;
    const deviceType = type === "desktop" ? DeviceType.DESKTOP :
        type === "mobile" ? DeviceType.MOBILE :
            type === "tablet" ? DeviceType.TABLET : DeviceType.OTHER

    let deviceId: string;
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
    }
    return deviceId;
}
