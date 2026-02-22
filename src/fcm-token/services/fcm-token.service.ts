import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IFCMTokenRepository, IFCMTokenResponse, IFCMTokenService } from '../interfaces';
import { CreateFcmTokenDto } from '../dto/fcm-token.dto';
import { FCMToken } from 'generated/prisma/client';

@Injectable()
export class FcmTokenService implements IFCMTokenService {
  constructor(private fcmTokenRepository: IFCMTokenRepository) { }

  async createFCMToken(createFcmTokenDto: CreateFcmTokenDto): Promise<IFCMTokenResponse> {
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
        message: "Fcm token registered"
      };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.meta || 'Error occurred check the log in the server',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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
