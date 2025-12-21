import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IOtpRequestRepository, IOtpRequestService } from "../interfaces";
import { Prisma, OTPRequests } from "generated/prisma/client";

@Injectable()
export class OtpRequestService implements IOtpRequestService {
  constructor(private otpRequestRepository: IOtpRequestRepository) { }

  async createOTPRequest(createOTPRequestArgs: Prisma.OTPRequestsCreateArgs): Promise<OTPRequests> {
    try {
      return await this.otpRequestRepository.createOTPRequest(createOTPRequestArgs);
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

  async getOTPRequest(getOTPRequestArgs: Prisma.OTPRequestsFindUniqueArgs): Promise<OTPRequests> {
    try {
      return await this.otpRequestRepository.getOTPRequest(getOTPRequestArgs);
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

  async updateOTPRequest(updateOTPRequestArgs: Prisma.OTPRequestsUpdateArgs): Promise<OTPRequests> {
    try {
      return await this.otpRequestRepository.updateOTPRequest(updateOTPRequestArgs);
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
