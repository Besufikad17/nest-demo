import { LoginDto, RecoverAccountDto, RefreshTokenDto, RegisterDto, ResetPasswordDto } from "../dto";
import { IApiResponse } from "src/common/interfaces";

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface IGoogleUser {
  googleId: string;
  email: string;
}

export abstract class IAuthService {
  abstract login(
    loginDto: LoginDto,
    deviceInfo: string,
    ip: string
  ): Promise<IApiResponse<IAuthResponse>>;

  abstract register(
    registerDto: RegisterDto,
    deviceInfo: string,
    ip: string
  ): Promise<IApiResponse<IAuthResponse>>;

  abstract registerUserByGoogleSSO(user: any): Promise<IApiResponse<any>>;

  abstract resetPassword(
    resetPasswordDto: ResetPasswordDto,
    userId: string,
    deviceInfo: string,
    ip: string
  ): Promise<IApiResponse<null>>;

  abstract recoverAccount(
    recoverAccountDto: RecoverAccountDto,
    deviceInfo: string,
    ip: string
  ): Promise<IApiResponse<null>>;

  abstract refreshToken(
    refreshTokenDto: RefreshTokenDto,
    deviceInfo: string,
    ip: string
  ): Promise<IApiResponse<IAuthResponse>>;
}
