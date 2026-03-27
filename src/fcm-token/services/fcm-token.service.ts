import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IFCMTokenRepository, IFCMTokenResponse, IFCMTokenService } from '../interfaces';
import { CreateFcmTokenDto } from '../dto/fcm-token.dto';
import { FCMToken } from 'generated/prisma/client';
import { IApiResponse } from 'src/common/interfaces';
import { ErrorCode } from 'src/common/enums';

@Injectable()
export class FcmTokenService implements IFCMTokenService {
  constructor(private fcmTokenRepository: IFCMTokenRepository) { }

  async createFCMToken(createFcmTokenDto: CreateFcmTokenDto): Promise<IApiResponse<IFCMTokenResponse>> {
    try {
      const { userId } = createFcmTokenDto;

      const existingFcmToken = await this.fcmTokenRepository.findFCMToken({
        where: { userId }
      });

      if (existingFcmToken) {
        await this.fcmTokenRepository.deleteFCMToken({
          where: { id: existingFcmToken.id }
        });
      }

      await this.fcmTokenRepository.createFCMToken({
        data: {
          ...createFcmTokenDto
        }
      });

      return {
        success: true,
        message: "Fcm token registered"
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

  async getTokens(userId: string): Promise<FCMToken[]> {
    try {
      return await this.fcmTokenRepository.findFCMTokens({
        where: {
          userId: userId
        }
      });
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.meta || 'Error occurred check the log in the server',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
