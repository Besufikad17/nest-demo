import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { FindOTPDto, GenerateOTPDto, VerifyOTPDto } from "../dto/otp.dto";
import { IOTPResponse, IOtpService } from "../interfaces/otp.service.interface";
import { OTP } from "@prisma/client";
import { OTPRepository } from "../repositories/otp.repository";
import { hash, compare } from "src/common/utils/hash.utils";
import { ConfigService } from "@nestjs/config";
import { OTPRequestRepository } from "../repositories/otp-request.repository";
import { addDays, addHours } from "src/common/utils/date.utils";
import { IUserActivityService } from "src/user-activity/interfaces";
// import { ClientKafka } from "@nestjs/microservices";
// import { IOTPNotification } from "src/common/interfaces/notification.interface";

@Injectable()
export class OTPService implements IOtpService {
  constructor(
    private otpRepository: OTPRepository,
    private otpRequestRepository: OTPRequestRepository,
    private userActivityService: IUserActivityService,
    private configService: ConfigService,
    //@Inject('NOTIFICATION_SERVICE') private client: ClientKafka
  ) { }

  async createOTP(generateOTPDto: GenerateOTPDto, deviceInfo?: string, ip?: string, flag: string = "create"): Promise<IOTPResponse> {
    try {
      let otpRequest = await this.otpRequestRepository.getOTPRequest({ where: { value: generateOTPDto.value } });

      if (otpRequest) {
        if (addDays(otpRequest.updatedAt, 1) > new Date()) {
          if (otpRequest.count === 5 && addHours(otpRequest.updatedAt, 1) > new Date()) {
            throw new HttpException("OTP Request limit exceeded!!", HttpStatus.BAD_REQUEST);
          }
        } else {
          await this.otpRequestRepository.updateOTPRequest({
            where: {
              id: otpRequest.id
            },
            data: {
              value: generateOTPDto.value, count: 0
            }
          });
        }
      } else {
        otpRequest = await this.otpRequestRepository.createOTPRequest({ data: { value: generateOTPDto.value } });
      }

      const otp = await this.getOTP(generateOTPDto);

      if (otp) {
        await this.otpRepository.deleteOTP({ where: { id: otp.id } });
      }

      let value: string = `${Math.floor(100000 + Math.random() * 900000)}`;
      let otpCode: string = await hash(generateOTPDto.identifier === "EMAIL" ? value : "000000", this.configService.get<number>('BCRYPT_SALT') || 10);
      var expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await this.otpRepository.createOTP({
        data: {
          ...generateOTPDto,
          otpCode: otpCode,
          expiresAt: expiresAt
        }
      });

      await this.otpRequestRepository.updateOTPRequest({
        where: {
          id: otpRequest.id
        },
        data: {
          value: generateOTPDto.value,
          count: otpRequest.count + 1
        }
      });

      // const notificationPayload: IOTPNotification = {
      //   userId: generateOTPDto.userId,
      //   emailOrPhone: generateOTPDto.value,
      //   type: generateOTPDto.identifier === "PHONE" ? "SMS" : "EMAIL",
      //   subject: "Account verification",
      //   message: `${value}`,
      //   messageType: otp?.type!
      // };
      //
      // this.client.emit('notification.send.otp', notificationPayload);

      if (generateOTPDto.userId && flag === "create") {
        await this.userActivityService.addUserActivity({
          userId: generateOTPDto.userId,
          action: "REQUEST_OTP",
          actionTimestamp: new Date(),
          deviceInfo: deviceInfo,
          ipAddress: ip
        });
      }

      return { message: "Verification code sent" };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async getOTP(findOTPDto: FindOTPDto): Promise<OTP | null> {
    try {
      return await this.otpRepository.getOTP({
        where: {
          AND: [
            {
              value: findOTPDto.value
            },
            {
              userId: findOTPDto.userId
            },
            {
              type: findOTPDto.type
            }
          ]
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
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async resendOTP(generateOTPDto: GenerateOTPDto, deviceInfo: string, ip: string): Promise<IOTPResponse> {
    try {
      const otp = await this.getOTP(generateOTPDto);

      if (otp) {
        await this.otpRepository.deleteOTP({ where: { id: otp.id } });
      }

      if (generateOTPDto.userId) {
        await this.userActivityService.addUserActivity({
          userId: generateOTPDto.userId,
          action: "REQUEST_RESEND_OTP",
          actionTimestamp: new Date(),
          deviceInfo: deviceInfo,
          ipAddress: ip
        });
      }

      return await this.createOTP(generateOTPDto, deviceInfo, ip, "resend");
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async verifyOTP(verifyOtpDto: VerifyOTPDto, deviceInfo: string, ip: string): Promise<IOTPResponse> {
    try {
      const otp = await this.otpRepository.getOTP({
        where: {
          value: verifyOtpDto.value,
          type: verifyOtpDto.type
        }
      });

      if (!otp) {
        throw new HttpException("Invalid code!!", HttpStatus.BAD_REQUEST);
      }

      if (otp.attempts > 0) {
        if (otp.expiresAt > new Date()) {
          let otpMatch: boolean = await compare(verifyOtpDto.otpCode, otp.otpCode);

          if (otpMatch) {
            if (otp.status === "PENDING") {
              await this.otpRepository.updateOTP({ where: { id: otp.id }, data: { status: "VERIFIED" } });

              if (verifyOtpDto.userId) {
                await this.userActivityService.addUserActivity({
                  userId: verifyOtpDto.userId,
                  action: "VALIDATE_OTP",
                  actionTimestamp: new Date(),
                  deviceInfo: deviceInfo,
                  ipAddress: ip
                });
              }

              return { message: "Verification completed" };
            } else {
              throw new HttpException(`OTP has ${otp.status.toLowerCase()}!!`, HttpStatus.BAD_REQUEST);
            }
          } else {
            await this.otpRepository.updateOTP({ where: { id: otp.id }, data: { attempts: otp.attempts - 1 } });
            throw new HttpException("Invalid code!!", HttpStatus.BAD_REQUEST);
          }
        } else {
          await this.otpRepository.updateOTP({ where: { id: otp.id }, data: { status: "EXPIRED" } });
          throw new HttpException("OTP expired!!", HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException("You have reached maximum trial!!", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || 'Error occurred check the log in the server',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
