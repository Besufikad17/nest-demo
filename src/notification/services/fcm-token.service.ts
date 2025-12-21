import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IFcmTokenRepository, IFcmTokenResponse, IFcmTokenService } from "../interfaces";
import { RegisterFcmTokenDto } from "../dto/notification.dto";

@Injectable()
export class FcmTokenService implements IFcmTokenService {
  constructor(private fcmTokenRepository: IFcmTokenRepository) { }

  async registerFcmToken(registerFcmTokenDto: RegisterFcmTokenDto, userId: string): Promise<IFcmTokenResponse> {
    try {
      await this.fcmTokenRepository.createFcmToken({
        data: {
          userId,
          ...registerFcmTokenDto
        }
      });

      return {
        message: "Fcm token registered"
      };
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
}
