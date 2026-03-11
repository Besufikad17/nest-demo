import { LoginDto, RecoverAccountDto, RefreshTokenDto, RegisterDto, ResetPasswordDto } from "../dto";
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";

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
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<IAuthResponse>>;

  abstract register(
    registerDto: RegisterDto,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<IAuthResponse>>;

  abstract registerUserByGoogleSSO(user: any): Promise<IApiResponse<any>>;

  abstract resetPassword(
    resetPasswordDto: ResetPasswordDto,
    userId: string,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<null>>;

  abstract recoverAccount(
    recoverAccountDto: RecoverAccountDto,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<null>>;

  abstract refreshToken(
    refreshTokenDto: RefreshTokenDto,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<IAuthResponse>>;
}
