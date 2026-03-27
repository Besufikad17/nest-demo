import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { IAuthResponse, IAuthService, IGoogleUser } from "../interfaces";
import { ConfigService } from "@nestjs/config";
import { LoginDto, RecoverAccountDto, RefreshTokenDto, RegisterDto, ResetPasswordDto } from "../dto";
import { hash, compare } from "src/common/utils/hash.utils";
import { JwtService } from "@nestjs/jwt";
import { IUserService } from "src/user/interfaces";
import { IUserTwoStepVerificationService } from "src/user-two-step-verification/interfaces";
import { IUserSSOService } from "src/user-sso/interfaces";
import { addMinutes } from "src/common/utils/date.utils";
import { IUserActivityService } from "src/user-activity/interfaces";
import { IRefreshTokenRepository } from "../interfaces/refresh-token.repository.interface";
import { decodeToken } from "src/common/utils/jwt.utils";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { IUserRoleService } from "src/user-role/interfaces";
import { INotificationSettingsService } from "src/notification-settings/interfaces";
import { IRoleService } from "src/role/interfaces";
import { IOtpService } from "src/otp/interfaces";
import { INotificationService } from "src/notification/interfaces";
import { NotificationType, UserAccountStatus, UserTwoFactorMethodType } from "generated/prisma/enums";
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";
import { AuthErrorCode, ErrorCode } from "src/common/enums";
import { IDeviceInfoService } from "src/device-info/interfaces";
import { addOrGetDeviceId } from "src/common/helpers/device-id.helper";

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private userActivityService: IUserActivityService,
    private userService: IUserService,
    private userSSOService: IUserSSOService,
    private userTwoStepService: IUserTwoStepVerificationService,
    private refreshTokenRepository: IRefreshTokenRepository,
    private configService: ConfigService,
    private jwtService: JwtService,
    private notificationService: INotificationService,
    private notificationSettingsService: INotificationSettingsService,
    private userRoleService: IUserRoleService,
    private roleService: IRoleService,
    private otpService: IOtpService,
    private deviceInfoService: IDeviceInfoService
  ) { }

  private async generateToken(userId: string, email: string): Promise<string> {
    const secretKey = this.configService.get<string>("JWT_SECRET");
    if (!secretKey) {
      throw new Error("JWT_SECRET_KEY is not defined");
    }

    return this.jwtService.sign<any>(
      {
        sub: userId,
        email: email
      },
      {
        secret: secretKey,
        expiresIn: this.configService.get("ACCESS_TOKEN_EXPIRES_IN") || "1hr",
      },
    );
  }

  private async generateRefreshToken(userId: string, deviceId: string, email: string, currentRefreshToken?: string, currentRefreshTokenExpiryDate?: Date) {
    const newRefreshToken = this.jwtService.sign<any>(
      { sub: userId, email: email },
      {
        secret: this.configService.get<string>("JWT_SECRET"),
        expiresIn: this.configService.get("REFRESH_TOKEN_EXPIRES_IN") || "30d"
      },
    );

    if (currentRefreshToken && currentRefreshTokenExpiryDate) {
      const tokenExists = await this.refreshTokenRepository.findRefreshToken({
        where: {
          userId: userId,
          refreshToken: newRefreshToken
        }
      });

      if (tokenExists) {
        throw new HttpException({ message: "Invalid token!!", code: AuthErrorCode.INVALID_TOKEN }, HttpStatus.BAD_REQUEST);
      }

      await this.refreshTokenRepository.createRefreshToken({
        data: {
          userId,
          deviceId,
          refreshToken: currentRefreshToken,
          expiresAt: currentRefreshTokenExpiryDate
        }
      });
    }

    return newRefreshToken;
  }

  async login(loginDto: LoginDto, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<IAuthResponse>> {
    try {
      const { email, phoneNumber, password } = loginDto;

      const { data: user } = await this.userService.findUser({ email: email, phoneNumber: phoneNumber }, RoleEnums.USER, true);

      if (!user) {
        throw new HttpException({ message: "User not found!!", code: ErrorCode.USER_NOT_FOUND }, HttpStatus.BAD_REQUEST);
      }

      const passwordMatch: boolean = await compare(password, user.passwordHash!);
      if (!passwordMatch) {
        throw new HttpException({ message: "Invalid credentials!!", code: AuthErrorCode.INVALID_CREDENTIALS }, HttpStatus.BAD_REQUEST);
      }

      const twoFactor = await this.userTwoStepService.finUserTwoStepVerification(user.id);
      if (twoFactor) {
        if (twoFactor.methodType === "EMAIL") {
          const otp = await this.otpService.getOTP({
            value: email,
            type: "TWO_FACTOR_AUTHENTICATION",
            identifier: "EMAIL"
          });

          if (!otp || otp.status !== "VERIFIED" && otp.updatedAt < addMinutes(new Date(), -3)) {
            throw new HttpException({
              message: "Please verify your account first",
              code: AuthErrorCode.ACCOUNT_NOT_VERIFIED
            }, HttpStatus.BAD_REQUEST);
          }
        }
      }

      if (!user.lastLogin) {
        await this.userService.updateUser({ isActive: true, accountStatus: UserAccountStatus.ACTIVE }, user.id);
      }
      await this.userService.updateUser({ lastLogin: new Date() }, user.id);

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, user.id, ip);
      await this.userActivityService.addUserActivity({
        userId: user.id,
        action: email ? "LOGIN_WITH_EMAIL" : "LOGIN_WITH_PHONE",
        actionTimestamp: new Date(),
        deviceId: deviceId
      });

      await this.notificationService.createNotification({
        email: email,
        userId: user.id,
        type: NotificationType.EMAIL,
        title: "Login Successful",
        message: `You have successfully logged in to your account on device ${deviceInfo} and ip ${ip}`
      });

      return {
        success: true,
        message: "User successfully logged in",
        data: {
          accessToken: await this.generateToken(user.id, user.email!),
          refreshToken: await this.generateRefreshToken(user.id, deviceId, email)
        },
        error: null
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        };
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

  async register(registerDto: RegisterDto, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<IAuthResponse>> {
    try {
      const { password, ...userWithoutPassword } = registerDto;

      const otpWithEmail = await this.otpService.getOTP({
        value: userWithoutPassword.email,
        type: "ACCOUNT_VERIFICATION",
        identifier: "EMAIL"
      });

      const otpWithPhone = await this.otpService.getOTP({
        value: userWithoutPassword.phoneNumber,
        type: "ACCOUNT_VERIFICATION",
        identifier: "PHONE"
      });

      if (
        (otpWithEmail && (otpWithEmail.status !== "VERIFIED" || otpWithEmail.updatedAt < addMinutes(new Date(), -3))) ||
        (otpWithPhone && (otpWithPhone.status !== "VERIFIED" || otpWithPhone.updatedAt < addMinutes(new Date(), -3))) ||
        (!otpWithEmail && !otpWithPhone)
      ) {
        throw new HttpException({
          message: "Please verify your account first",
          code: AuthErrorCode.ACCOUNT_NOT_VERIFIED
        }, HttpStatus.BAD_REQUEST);
      }

      let hashedPassword: string = await hash(password, this.configService.get<number>("BCRYPT_SALT") || 10);
      const { id } = await this.userService.createUser({
        passwordHash: hashedPassword,
        ...userWithoutPassword
      });

      const userRole = await this.roleService.getRole({ roleName: "user" });

      await this.userRoleService.addUserRole({
        userId: id,
        roleId: userRole?.id!
      });

      await this.notificationSettingsService.addNotificationSetting({
        userId: id,
        notifcationType: "EMAIL"
      });

      await this.userTwoStepService.createUserTwoStepVerification({
        methodType: "EMAIL",
        methodDetail: "OTP code is sent via email",
        isEnabled: true,
        isPrimary: true
      }, id, "", deviceInfo, ip);

      await this.userService.updateUser({
        twoStepEnabled: true
      }, id);

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, id, ip);
      await this.userActivityService.addUserActivity({
        userId: id,
        action: "REGISTER_WITH_EMAIL",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        message: "User registered successfully",
        success: true,
        error: null,
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
      } else if (error.code === "P2002") {
        return {
          success: false,
          message: "User already exists!!",
          data: null,
          error: AuthErrorCode.USER_ALREADY_EXISTS,
        };
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

  async registerUserByGoogleSSO(user: IGoogleUser): Promise<IApiResponse<any>> {
    try {
      const { email, googleId } = user;

      const userInDb = await this.userSSOService.findUserSSO({ provider: "GOOGLE", providerUserId: googleId, email: email });
      if (userInDb) {
        return {
          success: true,
          message: "User info fetched successfully",
          data: await this.generateToken(userInDb.userId, email),
          error: null
        };
      }

      const newUser = await this.userService.createUser({});
      await this.userSSOService.createUserSSO({ userId: newUser.id, provider: "GOOGLE", providerUserId: googleId, email: email });

      await this.userActivityService.addUserActivity({
        userId: newUser.id,
        action: "REGISTER_WITH_GOOGLE_SSO",
        actionTimestamp: new Date(),
      });

      return {
        success: true,
        message: "User info fetched successfully",
        data: await this.generateToken(newUser.id, email),
        error: null
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

  async resetPassword(resetPasswordDto: ResetPasswordDto, userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<any>> {
    try {
      const { data: user } = await this.userService.findUser({ id: userId }, RoleEnums.USER, true, userId);
      const twoFactorMethod = await this.userTwoStepService.finUserTwoStepVerification(userId);

      if (
        twoFactorMethod?.methodType === UserTwoFactorMethodType.EMAIL ||
        twoFactorMethod?.methodType === UserTwoFactorMethodType.SMS
      ) {
        const otp = await this.otpService.getOTP({
          value: twoFactorMethod?.methodType === UserTwoFactorMethodType.EMAIL ? user?.email! : user?.phoneNumber!,
          type: "PASSWORD_RESET",
          identifier: twoFactorMethod?.methodType === UserTwoFactorMethodType.EMAIL ? "EMAIL" : "PHONE"
        });

        if (!otp || otp.status !== "VERIFIED" || otp.updatedAt < addMinutes(new Date(), -3)) {
          throw new HttpException({
            message: "Please verify your account first",
            code: AuthErrorCode.ACCOUNT_NOT_VERIFIED
          }, HttpStatus.BAD_REQUEST);
        }
      }

      if (resetPasswordDto.currentPassword === resetPasswordDto.newPassword) {
        throw new HttpException({
          message: "Please enter new password",
          code: AuthErrorCode.NEW_PASSWORD_SAME_AS_OLD
        }, HttpStatus.BAD_REQUEST);
      }

      const currentPasswordMatch: boolean = await compare(resetPasswordDto.currentPassword, user?.passwordHash || "");
      if (!currentPasswordMatch) {
        throw new HttpException({
          message: "Current password doesn't match!!",
          code: AuthErrorCode.INVALID_CREDENTIALS
        }, HttpStatus.BAD_REQUEST);
      }

      const newPassword = await hash(resetPasswordDto.newPassword, this.configService.get<number>("BCRYPT_SALT") || 10);
      await this.userService.updateUser({
        passwordHash: newPassword
      }, user?.id!);

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, user.id, ip);
      await this.userActivityService.addUserActivity({
        userId: user?.id!,
        action: "PASSWORD_RESET",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        success: true,
        message: "Password reset completed successfully",
        error: null
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        };
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

  async recoverAccount(recoverAccountDto: RecoverAccountDto, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<any>> {
    try {
      const { data: user } = await this.userService.findUser({
        email: recoverAccountDto.value,
        phoneNumber: recoverAccountDto.newPassword
      }, RoleEnums.USER, false);

      if (!user) {
        throw new HttpException({ message: "User not found!!", code: ErrorCode.USER_NOT_FOUND }, HttpStatus.BAD_REQUEST);
      }

      const twoFactorMethod = await this.userTwoStepService.finUserTwoStepVerification(user.id);

      if (twoFactorMethod?.methodType === UserTwoFactorMethodType.EMAIL || twoFactorMethod?.methodType === UserTwoFactorMethodType.SMS) {
        const otp = await this.otpService.getOTP({
          value: twoFactorMethod?.methodType === UserTwoFactorMethodType.EMAIL ? user?.email! : user?.phoneNumber!,
          type: "ACCOUNT_RECOVERY",
          identifier: twoFactorMethod?.methodType === UserTwoFactorMethodType.EMAIL ? "EMAIL" : "PHONE"
        });

        if (!otp || otp.status !== "VERIFIED" || otp.updatedAt < addMinutes(new Date(), -3)) {
          throw new HttpException({ message: "Please verify your account first", code: AuthErrorCode.ACCOUNT_NOT_VERIFIED }, HttpStatus.BAD_REQUEST);
        }
      }

      const newPassword = await hash(recoverAccountDto.newPassword, this.configService.get<number>("BCRYPT_SALT") || 10);

      await this.userService.updateUser({
        passwordHash: newPassword
      }, user?.id!);

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, user.id, ip);
      await this.userActivityService.addUserActivity({
        userId: user.id,
        action: "ACCOUNT_RECOVERY",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        success: true,
        message: "Password reset completed successfully",
        error: null
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        };
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

  async refreshToken(refreshTokenDto: RefreshTokenDto, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<IAuthResponse>> {
    try {
      const { userId, email, currentRefreshToken } = refreshTokenDto;

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      return {
        success: true,
        message: "Token refreshed successfully",
        data: {
          accessToken: await this.generateToken(userId, email),
          refreshToken: await this.generateRefreshToken(
            userId, deviceId, email, currentRefreshToken,
            currentRefreshToken ?
              new Date(decodeToken(currentRefreshToken).exp) : undefined)
        }
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return {
          success: false,
          message: error.message,
          data: null,
          error: error.getResponse(),
        };
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

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async clearExpiredRefreshTokens() {
    try {
      const expiredTokens = await this.refreshTokenRepository.findRefreshTokens({
        where: {
          expiresAt: {
            lte: new Date()
          }
        }
      });

      expiredTokens.map(async (expiredToken) => {
        await this.refreshTokenRepository.deleteRefreshToken({ where: { id: expiredToken.id } });
      });
    } catch (error) {
      console.log(error);
    }
  }
}
