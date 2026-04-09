import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { IDeviceInfoRepository, IDeviceInfoService } from '../interfaces';
import { DeviceInfo, DeviceType } from 'generated/prisma/client';
import { CreateDeviceInfoDto, GetDeviceInfoDto, UpdateDeviceInfoDto } from '../dto/device-info.dto';
import { IApiResponse, IDeviceInfo } from 'src/common/interfaces';
import { ErrorCode, SessionErrorCode } from 'src/common/enums';
import { IUserActivityService } from 'src/user-activity/interfaces';

@Injectable()
export class DeviceInfoService implements IDeviceInfoService {
    constructor(
        private deviceInfoRepository: IDeviceInfoRepository,
        private userActivityService: IUserActivityService
    ) { }

    async getDeviceInfo(getDeviceInfoDto: GetDeviceInfoDto): Promise<DeviceInfo | null> {
        try {
            return await this.deviceInfoRepository.findDeviceInfo({
                where: {
                    ...getDeviceInfoDto
                }
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getDeviceInfoById(id: string): Promise<DeviceInfo | null> {
        try {
            return await this.deviceInfoRepository.findDeviceInfo({ where: { id } });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async getSessions(userId: string): Promise<IApiResponse<DeviceInfo[]>> {
        try {
            const data = await this.deviceInfoRepository.findDeviceInfos({
                where: {
                    userId,
                    deletedAt: null
                }
            });

            return {
                success: true,
                message: 'Sessions fetched',
                data
            };
        } catch (error) {
            console.log(error);
            if (error instanceof HttpException) {
                return {
                    success: false,
                    message: error.message,
                    data: null,
                    error: error.getResponse(),
                };
            } else {
                return {
                    success: false,
                    message: "Error occurred check the log in the server",
                    data: null,
                    error: ErrorCode.GENERAL_ERROR,
                };
            }
        }
    }

    async removeSession(id: string, userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<null>> {
        try {
            const session = await this.deviceInfoRepository.findDeviceInfo({
                where: {
                    id,
                    userId
                }
            });

            if (!session) throw new HttpException({ message: 'Session not found!!', code: SessionErrorCode.SESSION_NOT_FOUND }, HttpStatus.NOT_FOUND);

            await this.deviceInfoRepository.deleteDeviceInfo({
                where: { id }
            });

            const { device, browserVersion, type, ...deviceInfoDetails } = deviceInfo;
            const deviceType = type === "desktop" ? DeviceType.DESKTOP :
                type === "mobile" ? DeviceType.MOBILE :
                    type === "tablet" ? DeviceType.TABLET : DeviceType.OTHER

            let deviceId: string;
            const deviceInfoInDb = await this.getDeviceInfo({
                userId,
                ...deviceInfoDetails,
                ipAddress: ip
            });

            if (deviceInfoInDb) {
                deviceId = deviceInfoInDb.id;

                await this.updateDeviceInfo({
                    id: deviceId,
                    lastActiveAt: new Date()
                });
            } else {
                const newDeviceInfo = await this.createDeviceInfo({
                    userId,
                    ...deviceInfoDetails,
                    name: device,
                    ipAddress: ip,
                    lastActiveAt: new Date(),
                    type: deviceType
                });
                deviceId = newDeviceInfo.id;
            }

            await this.userActivityService.addUserActivity({
                userId,
                action: "REMOVE_SESSION",
                actionTimestamp: new Date(),
                deviceId
            });

            return {
                success: true,
                message: 'Session removed.'
            };
        } catch (error) {
            console.log(error);
            if (error instanceof HttpException) {
                return {
                    success: false,
                    message: error.message,
                    data: null,
                    error: error.getResponse(),
                };
            } else {
                return {
                    success: false,
                    message: "Error occurred check the log in the server",
                    data: null,
                    error: ErrorCode.GENERAL_ERROR,
                };
            }
        }
    }

    async createDeviceInfo(createDeviceInfoDto: CreateDeviceInfoDto): Promise<DeviceInfo> {
        try {
            return await this.deviceInfoRepository.createDeviceInfo({
                data: { ...createDeviceInfoDto }
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updateDeviceInfo(updateDeviceInfoDto: UpdateDeviceInfoDto): Promise<DeviceInfo> {
        try {
            const { id, lastActiveAt } = updateDeviceInfoDto;

            return await this.deviceInfoRepository.updateDeviceInfo({
                where: {
                    id
                },
                data: {
                    lastActiveAt
                }
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
