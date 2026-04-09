import { HttpException, Injectable } from '@nestjs/common';
import { IDeviceInfoRepository, IDeviceInfoService } from '../interfaces';
import { DeviceInfo } from 'generated/prisma/client';
import { CreateDeviceInfoDto, GetDeviceInfoDto, UpdateDeviceInfoDto } from '../dto/device-info.dto';
import { IApiResponse } from 'src/common/interfaces';
import { ErrorCode } from 'src/common/enums';

@Injectable()
export class DeviceInfoService implements IDeviceInfoService {
    constructor(private deviceInfoRepository: IDeviceInfoRepository) { }

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
