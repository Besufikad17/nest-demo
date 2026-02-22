import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { IAuthResponse, IAuthService, IGoogleUser } from "../interfaces";
import { ConfigService } from "@nestjs/config";
import { LoginDto, RecoverAccountDto, RegisterDto, ResetPasswordDto } from "../dto";
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
import { NotificationType } from "generated/prisma/enums";

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
    private otpService: IOtpService
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

  private async generateRefreshToken(userId: string, email: string, currentRefreshToken?: string, currentRefreshTokenExpiryDate?: Date) {
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
        throw new HttpException("Invalid token!!", HttpStatus.BAD_REQUEST);
      }

      await this.refreshTokenRepository.createRefreshToken({
        data: {
          userId: userId,
          refreshToken: currentRefreshToken,
          expiresAt: currentRefreshTokenExpiryDate
        }
      });
    }

    return newRefreshToken;
  }

  async login(loginDto: LoginDto, deviceInfo: string, ip: string): Promise<IAuthResponse> {
    try {
      const { email, phoneNumber, password } = loginDto;

      const user = await this.userService.findUser({ email: email, phoneNumber: phoneNumber }, RoleEnums.USER);

      if (user) {
        const passwordMatch: boolean = await compare(password, user.passwordHash!);
        if (passwordMatch) {
          const twoFactor = await this.userTwoStepService.finUserTwoStepVerification(user.id);

          if (twoFactor) {
            if (twoFactor.methodType === "EMAIL") {
              const otp = await this.otpService.getOTP({
                value: email,
                type: "TWO_FACTOR_AUTHENTICATION",
                identifier: "EMAIL"
              });

              if (!otp || otp.status !== "VERIFIED" && otp.updatedAt < addMinutes(new Date(), -3)) {
                throw new HttpException("Please verify your account first", HttpStatus.BAD_REQUEST);
              }
            }
          }

          await this.userService.updateUser({ lastLogin: new Date() }, user.id);

          await this.userActivityService.addUserActivity({
            userId: user.id,
            action: email ? "LOGIN_WITH_EMAIL" : "LOGIN_WITH_PHONE",
            actionTimestamp: new Date(),
            deviceInfo: deviceInfo,
            ipAddress: ip
          });

          await this.notificationService.createNotification({
            email: email,
            userId: user.id,
            type: NotificationType.EMAIL,
            title: "Login Successful",
            message: `You have successfully logged in to your account on device ${deviceInfo} and ip ${ip}`
          });

          return {
            message: "User successfully logged in",
            accessToken: await this.generateToken(user.id, user.email!),
            refreshToken: await this.generateRefreshToken(user.id, email)
          };
        } else {
          throw new HttpException("Invalid credentials!!", HttpStatus.BAD_REQUEST);
        }
      } else {
        throw new HttpException("Invalid credentials!!", HttpStatus.BAD_REQUEST);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async register(registerDto: RegisterDto, deviceInfo: string, ip: string): Promise<IAuthResponse> {
    try {
      const { password, ...userWithoutPassword } = registerDto;

      const otpWithEmail = await this.otpService.getOTP({ value: userWithoutPassword.email, type: "ACCOUNT_VERIFICATION", identifier: "EMAIL" });
      const otpWithPhone = await this.otpService.getOTP({ value: userWithoutPassword.phoneNumber, type: "ACCOUNT_VERIFICATION", identifier: "PHONE" });
      console.log(otpWithEmail, otpWithPhone);

      if (
        (otpWithEmail && (otpWithEmail.status !== "VERIFIED" || otpWithEmail.updatedAt < addMinutes(new Date(), -3))) ||
        (otpWithPhone && (otpWithPhone.status !== "VERIFIED" || otpWithPhone.updatedAt < addMinutes(new Date(), -3))) ||
        (!otpWithEmail && !otpWithPhone)
      ) {
        return new HttpException("Please verify your account first!!", HttpStatus.BAD_REQUEST);
      }

      let hashedPassword: string = await hash(password, this.configService.get<number>("BCRYPT_SALT") || 10);
      const newUser = await this.userService.createUser({
        passwordHash: hashedPassword,
        ...userWithoutPassword
      });

      const userRole = await this.roleService.getRole({ roleName: "user" });

      await this.userRoleService.addUserRole({
        userId: newUser.id,
        roleId: userRole?.id!
      });

      await this.notificationSettingsService.addNotificationSetting({
        userId: newUser.id,
        notifcationType: "EMAIL"
      });

      await this.userTwoStepService.createUserTwoStepVerification({
        userId: newUser.id,
        methodType: "EMAIL",
        methodDetail: "OTP code is sent via email",
        isEnabled: true,
        isPrimary: true
      }, "", deviceInfo, ip);

      await this.userService.updateUser({
        twoStepEnabled: true
      }, newUser.id);

      await this.userActivityService.addUserActivity({
        userId: newUser.id,
        action: "REGISTER_WITH_EMAIL",
        actionTimestamp: new Date(),
        deviceInfo: deviceInfo,
        ipAddress: ip
      });

      return {
        message: "User registered successfully",
        accessToken: await this.generateToken(newUser.id, userWithoutPassword.email),
        refreshToken: await this.generateRefreshToken(newUser.id, userWithoutPassword.email)
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else if (error.code === "P2002") {
        throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  async registerUserByGoogleSSO(user: IGoogleUser): Promise<string> {
    try {
      const { email, googleId } = user;

      const userInDb = await this.userSSOService.findUserSSO({ provider: "GOOGLE", providerUserId: googleId, email: email });
      if (userInDb) {
        return await this.generateToken(userInDb.userId, email);
      }

      const newUser = await this.userService.createUser({});
      await this.userSSOService.createUserSSO({ userId: newUser.id, provider: "GOOGLE", providerUserId: googleId, email: email });

      await this.userActivityService.addUserActivity({
        userId: newUser.id,
        action: "REGISTER_WITH_GOOGLE_SSO",
        actionTimestamp: new Date(),
      });

      return await this.generateToken(newUser.id, email);
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, userId: string, deviceInfo: string, ip: string): Promise<IAuthResponse> {
    try {
      const user = await this.userService.findUser({ id: userId }, RoleEnums.USER, userId);
      const twoFactorMethod = await this.userTwoStepService.finUserTwoStepVerification(userId);

      if (twoFactorMethod?.methodType === "EMAIL" || twoFactorMethod?.methodType === "SMS") {
        const otp = await this.otpService.getOTP({
          value: twoFactorMethod?.methodType === "EMAIL" ? user?.email! : user?.phoneNumber!,
          type: "PASSWORD_RESET",
          identifier: twoFactorMethod?.methodType === "EMAIL" ? "EMAIL" : "PHONE"
        });

        if (!otp || otp.status !== "VERIFIED" || otp.updatedAt < addMinutes(new Date(), -3)) {
          throw new HttpException("Please verify your account first", HttpStatus.BAD_REQUEST);
        }
      }

      if (resetPasswordDto.currentPassword === resetPasswordDto.newPassword) {
        throw new HttpException("Please enter new password", HttpStatus.BAD_REQUEST);
      }

      const currentPasswordMatch: boolean = await compare(resetPasswordDto.currentPassword, user?.passwordHash || "");

      if (!currentPasswordMatch) {
        throw new HttpException("Current password doesn't match!!", HttpStatus.BAD_REQUEST);
      }

      const newPassword = await hash(resetPasswordDto.newPassword, this.configService.get<number>("BCRYPT_SALT") || 10);

      await this.userService.updateUser({
        passwordHash: newPassword
      }, user?.id!);

      await this.userActivityService.addUserActivity({
        userId: user?.id!,
        action: "PASSWORD_RESET",
        actionTimestamp: new Date(),
        deviceInfo: deviceInfo,
        ipAddress: ip
      });

      return { message: "Password reset completed successfully" };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async recoverAccount(recoverAccountDto: RecoverAccountDto, deviceInfo: string, ip: string): Promise<IAuthResponse> {
    try {
      const user = await this.userService.findUser({
        email: recoverAccountDto.value,
        phoneNumber: recoverAccountDto.newPassword
      }, RoleEnums.USER);

      if (!user) {
        throw new HttpException("User not found!!", HttpStatus.BAD_REQUEST);
      }

      const twoFactorMethod = await this.userTwoStepService.finUserTwoStepVerification(user.id);

      if (twoFactorMethod?.methodType === "EMAIL" || twoFactorMethod?.methodType === "SMS") {
        const otp = await this.otpService.getOTP({
          value: twoFactorMethod?.methodType === "EMAIL" ? user?.email! : user?.phoneNumber!,
          type: "ACCOUNT_RECOVERY",
          identifier: twoFactorMethod?.methodType === "EMAIL" ? "EMAIL" : "PHONE"
        });

        if (!otp || otp.status !== "VERIFIED" || otp.updatedAt < addMinutes(new Date(), -3)) {
          throw new HttpException("Please verify your account first", HttpStatus.BAD_REQUEST);
        }
      }

      const newPassword = await hash(recoverAccountDto.newPassword, this.configService.get<number>("BCRYPT_SALT") || 10);

      await this.userService.updateUser({
        passwordHash: newPassword
      }, user?.id!);

      await this.userActivityService.addUserActivity({
        userId: user.id,
        action: "ACCOUNT_RECOVERY",
        actionTimestamp: new Date(),
        deviceInfo: deviceInfo,
        ipAddress: ip
      });

      return { message: "Password reset completed successfully" };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }

  async refreshToken(userId: string, email: string, currentRefreshToken?: string): Promise<IAuthResponse> {
    try {
      return {
        message: "Token refreshed successfully",
        accessToken: await this.generateToken(userId, email),
        refreshToken: await this.generateRefreshToken(
          userId, email, currentRefreshToken, currentRefreshToken ?
          new Date(decodeToken(currentRefreshToken).exp) : undefined)
      };
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
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
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(
          error.meta || "Error occurred check the log in the server",
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
