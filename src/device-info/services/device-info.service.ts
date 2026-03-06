import { Injectable } from '@nestjs/common';
import { IDeviceInfoRepository, IDeviceInfoService } from '../interfaces';
import { DeviceInfo } from 'generated/prisma/client';
import { CreateDeviceInfoDto, GetDeviceInfoDto, UpdateDeviceInfoDto } from '../dto/device-info.dto';

@Injectable()
export class DeviceInfoService implements IDeviceInfoService {
    constructor(private deviceInfoRepository: IDeviceInfoRepository) {}

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

    async createDeviceInfo(createDeviceInfoDto: CreateDeviceInfoDto): Promise<DeviceInfo> {
        try {
            return await this.deviceInfoRepository.createDeviceInfo({
                data: { ...createDeviceInfoDto }
            });
        } catch(error) {
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
