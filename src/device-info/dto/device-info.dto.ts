import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { DeviceType } from "generated/prisma/enums";

export class GetDeviceInfoDto {
    @IsNotEmpty()
    @IsUUID()
    userId: string;

    @IsNotEmpty()
    @IsString()
    os: string;

    @IsNotEmpty()
    @IsString()
    browser: string;

    @IsNotEmpty()
    @IsString()
    ipAddress: string;
}

export class CreateDeviceInfoDto extends GetDeviceInfoDto {
    @IsNotEmpty()
    @IsEnum(DeviceType, {
        message: `Device type must be one of: ${Object.values(DeviceType).join(', ')}`
    })
    type: DeviceType;

    @IsNotEmpty()
    @IsDate()
    lastActiveAt: Date;

    @IsString()
    location?: string;
}

export class UpdateDeviceInfoDto {
    @IsNotEmpty()
    @IsUUID()
    id: string;

    @IsNotEmpty()
    @IsDate()
    lastActiveAt: Date;
}