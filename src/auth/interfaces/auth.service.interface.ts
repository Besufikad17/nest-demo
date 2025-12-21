import { LoginDto, RecoverAccountDto, RegisterDto, ResetPasswordDto } from "../dto";

export interface IAuthResponse {
  message: string;
  accessToken?: string;
  refreshToken?: string;
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
  ): Promise<IAuthResponse>;

  abstract register(
    registerDto: RegisterDto,
    deviceInfo: string,
    ip: string
  ): Promise<IAuthResponse>;

  abstract registerUserByGoogleSSO(user: any): Promise<any>;

  abstract resetPassword(
    resetPasswordDto: ResetPasswordDto,
    userId: string,
    deviceInfo: string,
    ip: string
  ): Promise<IAuthResponse>;

  abstract recoverAccount(
    recoverAccountDto: RecoverAccountDto,
    deviceInfo: string,
    ip: string
  ): Promise<IAuthResponse>;

  abstract refreshToken(
    userId: string,
    email: string,
    currentRefreshToken?: string,
  ): Promise<IAuthResponse>;
}
