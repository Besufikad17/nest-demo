import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { FindOtpDto, GenerateOtpDto, VerifyOtpDto } from "../dto/otp.dto";
import { IOtpService } from "../interfaces/otp.service.interface";
import { NotificationType, OTP } from "generated/prisma/client";
import { hash, compare } from "src/common/utils/hash.utils";
import { ConfigService } from "@nestjs/config";
import { addDays, addHours } from "src/common/utils/date.utils";
import { IUserActivityService } from "src/user-activity/interfaces";
import { IOtpRequestService } from "src/otp-request/interfaces";
import { IOtpRepository } from "../interfaces";
import { INotificationService } from "src/notification/interfaces";
import { IDeviceInfoService } from "src/device-info/interfaces";
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";
import { addOrGetDeviceId } from "src/common/helpers/device-id.helper";
import { ErrorCode } from "src/common/enums";

@Injectable()
export class OtpService implements IOtpService {
  constructor(
    private configService: ConfigService,
    private deviceInfoService: IDeviceInfoService,
    private notificationService: INotificationService,
    private otpRepository: IOtpRepository,
    private otpRequestService: IOtpRequestService,
    private userActivityService: IUserActivityService,
  ) { }

  async createOTP(generateOTPDto: GenerateOtpDto, deviceInfo?: IDeviceInfo, ip?: string, flag: string = "create"): Promise<IApiResponse<null>> {
    try {
      const { value, type, identifier, userId } = generateOTPDto;
      let otpRequest = await this.otpRequestService.getOTPRequest({ where: { value } });;

      if (otpRequest) {
        if (addDays(otpRequest.updatedAt, 1) > new Date()) {
          if (otpRequest.count === 5 && addHours(otpRequest.updatedAt, 1) > new Date()) {
            throw new HttpException("OTP Request limit exceeded!!", HttpStatus.BAD_REQUEST);
          }
        } else {
          await this.otpRequestService.updateOTPRequest({
            where: {
              id: otpRequest.id
            },
            data: {
              value,
              count: 0
            }
          });
        }
      } else {
        otpRequest = await this.otpRequestService.createOTPRequest({ data: { value } });
      }

      const otp = await this.getOTP({
        value,
        type,
        identifier
      });

      if (otp) {
        await this.otpRepository.deleteOTP({ where: { id: otp.id } });
      }

      let generatedValue: string = `${Math.floor(100000 + Math.random() * 900000)}`;
      let otpCode: string = await hash(generatedValue, this.configService.get<number>("BCRYPT_SALT") || 10);
      var expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await this.otpRepository.createOTP({
        data: {
          ...generateOTPDto,
          otpCode: otpCode,
          expiresAt: expiresAt
        }
      });

      const { id } = otpRequest;
      await this.otpRequestService.updateOTPRequest({
        where: {
          id
        },
        data: {
          value,
          count: {
            increment: 1
          }
        }
      });

      if (identifier === "PHONE") {
        console.log(generatedValue);
      }

      const notificationPayload = {
        userId,
        ...(identifier === 'EMAIL' ? { email: value } : {}),
        ...(identifier === 'PHONE' ? { phoneNumber: value } : {}),
        type: identifier === "PHONE" ? NotificationType.SMS : NotificationType.EMAIL,
        title: "Account verification",
        message: `${generatedValue}`,
      };

      await this.notificationService.createNotification({ ...notificationPayload });

      if (generateOTPDto.userId && flag === "create") {
        const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);

        await this.userActivityService.addUserActivity({
          userId: generateOTPDto.userId,
          action: "REQUEST_OTP",
          actionTimestamp: new Date(),
          deviceId
        });
      }

      return {
        success: true,
        message: "Verification code sent"
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        }
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

  async getOTP(findOTPDto: FindOtpDto): Promise<OTP | null> {
    try {
      const { value, type, userId } = findOTPDto;
      return await this.otpRepository.getOTP({
        where: {
          AND: [{ value }, { userId }, { type }]
        },
        orderBy: {
          createdAt: "desc"
        }
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async resendOTP(generateOTPDto: GenerateOtpDto, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<null>> {
    try {
      const otp = await this.getOTP(generateOTPDto);

      if (otp) {
        await this.otpRepository.deleteOTP({ where: { id: otp.id } });
      }

      const { userId } = generateOTPDto;
      if (userId) {
        const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
        await this.userActivityService.addUserActivity({
          userId,
          action: "REQUEST_RESEND_OTP",
          actionTimestamp: new Date(),
          deviceId
        });
      }

      return await this.createOTP(generateOTPDto, deviceInfo, ip, "resend");
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        }
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

  async verifyOTP(verifyOtpDto: VerifyOtpDto, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<null>> {
    try {
      const { value, type, otpCode, userId } = verifyOtpDto;
      const otp = await this.otpRepository.getOTP({
        where: {
          value,
          type,
          userId
        }
      });

      if (!otp) {
        throw new HttpException("Invalid code!!", HttpStatus.BAD_REQUEST);
      }

      if (otp.attempts <= 0) {
        throw new HttpException("You have reached maximum trial!!", HttpStatus.BAD_REQUEST);
      }

      if (otp.expiresAt <= new Date()) {
        await this.otpRepository.updateOTP({ where: { id: otp.id }, data: { status: "EXPIRED" } });
        throw new HttpException("OTP expired!!", HttpStatus.BAD_REQUEST);
      }

      let otpMatch: boolean = await compare(otpCode, otp.otpCode);
      if (!otpMatch) {
        await this.otpRepository.updateOTP({ where: { id: otp.id }, data: { attempts: otp.attempts - 1 } });
        throw new HttpException("Invalid code!!", HttpStatus.BAD_REQUEST);
      }

      if (otp.status !== "PENDING") {
        throw new HttpException(`OTP has ${otp.status.toLowerCase()}!!`, HttpStatus.BAD_REQUEST);
      }

      await this.otpRepository.updateOTP({ where: { id: otp.id }, data: { status: "VERIFIED" } });

      if (userId) {
        const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
        await this.userActivityService.addUserActivity({
          userId: verifyOtpDto.userId,
          action: "VALIDATE_OTP",
          actionTimestamp: new Date(),
          deviceId
        });
      }

      return {
        success: true,
        message: "Verification completed"
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        }
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
}
