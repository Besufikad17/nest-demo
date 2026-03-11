import { IsDate, IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { DeviceType } from "generated/prisma/enums";

export class GetDeviceInfoDto {
    @IsNotEmpty()
    @IsUUID()
    readonly userId: string;

    @IsNotEmpty()
    @IsString()
    readonly os: string;

    @IsNotEmpty()
    @IsString()
    readonly browser: string;

    @IsNotEmpty()
    @IsString()
    readonly ipAddress: string;
}

export class CreateDeviceInfoDto extends GetDeviceInfoDto {
    @IsNotEmpty()
    @IsString()
    readonly name: string;

    @IsNotEmpty()
    @IsEnum(DeviceType, {
        message: `Device type must be one of: ${Object.values(DeviceType).join(', ')}`
    })
    readonly type: DeviceType;

    @IsNotEmpty()
    @IsDate()
    readonly lastActiveAt: Date;

    @IsString()
    readonly location?: string;
}

export class UpdateDeviceInfoDto {
    @IsNotEmpty()
    @IsUUID()
    readonly id: string;

    @IsNotEmpty()
    @IsDate()
    readonly lastActiveAt: Date;
}
