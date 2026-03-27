import { HttpException, HttpStatus, Injectable, NotFoundException } from "@nestjs/common";
import { ICreate2FAResponse, IUserTwoStepVerificationService, IVerify2FAResponse } from "../interfaces/user-two-step-verification.service.interface";
import { UserTwoStepVerificationRepository } from "../repositories/user-two-step-verification.repository";
import { UserTwoFactorMethodType, UserTwoStepVerification } from "generated/prisma/client"
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse
} from "@simplewebauthn/server";
import {
  AddPasskeyDto,
  CreateUserTwoStepVerificationDto,
  GetPrimary2FaDto,
  UpdateUserTwoStepVerifcationDto,
  VerifyPasskeyDto,
  VerifyUserTwoStepVerificationDto
} from "../dto/user-two-step-verification.dto";
import { authenticator } from "otplib";
import { toDataURL } from "qrcode";
import { IUserService } from "src/user/interfaces";
import { IWebAuthnCredentialService } from "src/web-authn-credential/interfaces/web-authn-credential.service.interface";
import { parseTransportsToFutureArray } from "src/web-authn-credential/utils/strings";
import { IUserActivityService } from "src/user-activity/interfaces";
import { RoleEnums } from "src/user-role/enums/role.enum";
import { IApiResponse, IDeviceInfo } from "src/common/interfaces";
import { addOrGetDeviceId } from "src/common/helpers/device-id.helper";
import { IDeviceInfoService } from "src/device-info/interfaces";
import { ErrorCode } from "src/common/enums";

@Injectable()
export class UserTwoStepVerificationService implements IUserTwoStepVerificationService {
  constructor(
    private deviceInfoService: IDeviceInfoService,
    private userActivityService: IUserActivityService,
    private userTwoStepVerificationRepository: UserTwoStepVerificationRepository,
    private userService: IUserService,
    private webAuthnCredentialService: IWebAuthnCredentialService
  ) { }

  async createUserTwoStepVerification(
    createUserTwoStepVerificationDto: CreateUserTwoStepVerificationDto,
    userId: string,
    email: string,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<ICreate2FAResponse>> {
    try {
      const { isPrimary, methodType } = createUserTwoStepVerificationDto;

      if (isPrimary) {
        const primary2FaMethod = await this.userTwoStepVerificationRepository.findUserTwoStepVerification({
          where: {
            userId,
            isPrimary
          }
        });

        if (primary2FaMethod?.isPrimary) {
          await this.userTwoStepVerificationRepository.updateUserTwoStepVerification({
            where: { id: primary2FaMethod.id },
            data: {
              isPrimary: false,
              isEnabled: primary2FaMethod.isEnabled
            }
          });
        }
      }

      let qrCode = null;
      if (methodType === UserTwoFactorMethodType.AUTHENTICATOR) {
        const secret = authenticator.generateSecret();
        const otpAuthUrl = authenticator.keyuri(email, "nest-demo", secret);
        qrCode = await toDataURL(otpAuthUrl);
        await this.userTwoStepVerificationRepository.createUserTwoStepVerification({
          data: {
            secret: secret,
            userId,
            ...createUserTwoStepVerificationDto
          }
        });

        const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
        await this.userActivityService.addUserActivity({
          userId,
          action: "ADD_TWO_STEP_VERIFICATION",
          actionTimestamp: new Date(),
          deviceId
        });

      } else {
        await this.userTwoStepVerificationRepository.createUserTwoStepVerification({
          data: {
            userId,
            ...createUserTwoStepVerificationDto
          }
        });
      }

      return {
        success: true,
        message: 'Two step verification successfuly added.',
        data: {
          qrCode
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

  async finUserTwoStepVerification(userId: string): Promise<UserTwoStepVerification | null> {
    try {
      return await this.userTwoStepVerificationRepository.findUserTwoStepVerification({
        where: { userId: userId }
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

  async finUserTwoStepVerifications(userId: string): Promise<IApiResponse<UserTwoStepVerification[]>> {
    try {
      const data = await this.userTwoStepVerificationRepository.findUserTwoStepVerifications({ where: { userId: userId } });

      return {
        success: false,
        message: 'Two step verifications fetched.',
        data,
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

  async getPrimary2Fa(getPrimary2FaDto: GetPrimary2FaDto): Promise<IApiResponse<UserTwoStepVerification | null>> {
    try {
      const { data: user } = await this.userService.findUser({ email: getPrimary2FaDto.value, phoneNumber: getPrimary2FaDto.value }, RoleEnums.USER, false);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const data = await this.userTwoStepVerificationRepository.findUserTwoStepVerification({
        where: {
          userId: user.id,
          isPrimary: true,
          isEnabled: true
        }
      });

      return {
        success: true,
        message: 'Primary 2FA fetched',
        data
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

  async updateUserTwoStepVerification(
    updateUserTwoStepVerificationDto: UpdateUserTwoStepVerifcationDto,
    userId: string,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<UserTwoStepVerification>> {
    try {
      const { id, isPrimary } = updateUserTwoStepVerificationDto;

      const user2Fa = await this.userTwoStepVerificationRepository.findUserTwoStepVerification({
        where: {
          id,
          userId: userId,
        }
      });

      if (!user2Fa) {
        throw new HttpException("2FA not found!!", HttpStatus.BAD_REQUEST);
      }

      if (isPrimary) {
        const primary2FaMethod = await this.userTwoStepVerificationRepository.findUserTwoStepVerification({
          where: {
            userId: userId,
            isPrimary: true
          }
        });

        if (primary2FaMethod?.isPrimary) {
          await this.userTwoStepVerificationRepository.updateUserTwoStepVerification({
            where: { id: primary2FaMethod.id },
            data: {
              isPrimary: false,
              isEnabled: primary2FaMethod.isEnabled
            }
          });
        }
      }

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      await this.userActivityService.addUserActivity({
        userId: userId,
        action: "UPDATE_TWO_STEP_VERIFICATION",
        actionTimestamp: new Date(),
        deviceId
      });

      await this.userTwoStepVerificationRepository.updateUserTwoStepVerification({
        where: {
          id: user2Fa.id
        },
        data: updateUserTwoStepVerificationDto
      });

      return {
        success: true,
        message: 'Two step verification updated.'
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

  async verifyUserTwoStepVerification(
    verifyUserTwoStepVerificationDto: VerifyUserTwoStepVerificationDto,
    userId: string,
    deviceInfo: IDeviceInfo,
    ip: string
  ): Promise<IApiResponse<IVerify2FAResponse>> {
    try {
      const { twoFaCode } = verifyUserTwoStepVerificationDto;

      const twoFaMethod = await this.userTwoStepVerificationRepository.findUserTwoStepVerification({
        where: {
          userId,
          isPrimary: true,
          isEnabled: true
        }
      });

      if (!twoFaMethod) {
        throw new HttpException("2FA not found!!", HttpStatus.BAD_REQUEST);
      }

      if (!twoFaMethod) {
        throw new HttpException("Please add 2FA Authenticator method first!!", HttpStatus.BAD_REQUEST);
      }

      const valid = authenticator.verify({
        token: twoFaCode,
        secret: twoFaMethod.secret,
      });

      if (!valid) {
        throw new HttpException("Invalid 2FA code!!", HttpStatus.BAD_REQUEST);
      }

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      await this.userActivityService.addUserActivity({
        userId: userId,
        action: "VERIFY_TWO_FACTOR_CODE",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        success: true,
        message: "2FA code successfully verified",
        data: {
          valid: true
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

  async deleteUserTwoStepVerification(id: string, userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<any>> {
    try {
      const twoFaMethod = await this.userTwoStepVerificationRepository.findUserTwoStepVerification({
        where: {
          id: id,
          userId: userId
        }
      });

      if (!twoFaMethod) {
        throw new HttpException("2FA not found!!", HttpStatus.BAD_REQUEST);
      }

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      await this.userActivityService.addUserActivity({
        userId: userId,
        action: "DELETE_TWO_STEP_VERIFICATION",
        actionTimestamp: new Date(),
        deviceId
      });

      await this.userTwoStepVerificationRepository.deleteUserTwoStepVerification({ where: { id: id } });

      return {
        success: true,
        message: 'Two step verification removed.'
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

  async requestAddPasskey(userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<PublicKeyCredentialCreationOptionsJSON>> {
    try {
      const { data: user } = await this.userService.findUser({ id: userId }, RoleEnums.USER, false);

      console.log(userId);

      if (!user) {
        throw new HttpException("User not found!!", HttpStatus.BAD_REQUEST);
      }

      const passkeys = await this.webAuthnCredentialService.findWebAuthCredentials(user.id);

      const data = await generateRegistrationOptions({
        rpName: "nest-demo",
        rpID: "nest-demo.com",
        userID: Buffer.from(user.id),
        userName: user.email || user.phoneNumber!,
        attestationType: "none",
        excludeCredentials: passkeys.map(passkey => ({
          id: passkey.id,
          transports: parseTransportsToFutureArray(passkey.transports)
        })),
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "preferred",
        },
      });

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      await this.userActivityService.addUserActivity({
        userId: userId,
        action: "ADD_PASSKEY_REQUEST",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        success: true,
        message: 'Passkey added.',
        data,
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

  async addPasskey(addPasskeyDto: AddPasskeyDto, userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<null>> {
    try {
      const { data: user } = await this.userService.findUser({ id: userId }, RoleEnums.USER, false);

      if (!user) throw new HttpException("User not found!!", HttpStatus.BAD_REQUEST);

      const { data: currentOptions }: IApiResponse<PublicKeyCredentialCreationOptionsJSON> = await this.requestAddPasskey(user.id, deviceInfo, ip);

      const { verified, registrationInfo } = await verifyRegistrationResponse({
        response: addPasskeyDto.response,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: "http://localhost:4000",
        expectedRPID: "nest-demo.com",
      });

      if (!verified || !registrationInfo) {
        throw new HttpException("Error authenticating passkey!!", HttpStatus.BAD_REQUEST);
      }

      const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;

      await this.webAuthnCredentialService.createWebAuthnCredential({
        credentialId: Buffer.from(credential.id),
        publicKey: Buffer.from(credential.publicKey),
        counter: credential.counter,
        userId: user.id,
        transports: credential.transports!,
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp
      });

      await this.userTwoStepVerificationRepository.createUserTwoStepVerification({
        data: {
          userId: user.id,
          methodType: "PASSKEYS",
          methodDetail: "Authentication using passkeys (biometrics)",
          isPrimary: true,
          isEnabled: true
        }
      });

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      await this.userActivityService.addUserActivity({
        userId: userId,
        action: "ADD_PASSKEY",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        success: true,
        message: "Passkey authenticated successfully"
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

  async requestVerifyPasskey(userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<PublicKeyCredentialRequestOptionsJSON>> {
    try {
      const data = await generateAuthenticationOptions({
        allowCredentials: [],
        userVerification: "preferred",
        rpID: "nest-demo.com"
      });

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      await this.userActivityService.addUserActivity({
        userId: userId,
        action: "VERIFY_PASSKEY_REQUEST",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        success: true,
        message: 'Passkey added.',
        data,
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

  async verifyPasskey(verifyPasskeyDto: VerifyPasskeyDto, userId: string, deviceInfo: IDeviceInfo, ip: string): Promise<IApiResponse<IVerify2FAResponse>> {
    try {
      const { data: user } = await this.userService.findUser({ id: userId }, RoleEnums.USER, false);
      if (!user) throw new Error("User not found");

      const { data: currentOptions }: IApiResponse<PublicKeyCredentialRequestOptionsJSON> = await this.requestVerifyPasskey(user.id, deviceInfo, ip);

      const passkey = await this.webAuthnCredentialService.findWebAuthnCredential({
        userId: user.id,
        credentialId: Buffer.from(verifyPasskeyDto.response.id)
      });

      if (!passkey) {
        throw new Error(`Could not find passkey ${verifyPasskeyDto.response.id} for user ${user.id}`);
      }

      let verification = await verifyAuthenticationResponse({
        response: verifyPasskeyDto.response,
        expectedChallenge: currentOptions.challenge,
        expectedOrigin: origin,
        expectedRPID: "nest-demo.com",
        credential: {
          id: passkey.id,
          publicKey: passkey.publicKey,
          counter: passkey.counter,
          transports: parseTransportsToFutureArray(passkey.transports),
        },
      });

      if (!verification) {
        throw new HttpException("Error verifying passkey!!", HttpStatus.BAD_REQUEST);
      }

      const deviceId = await addOrGetDeviceId(this.deviceInfoService, deviceInfo, userId, ip);
      await this.userActivityService.addUserActivity({
        userId: userId,
        action: "VERIFY_PASSKEY",
        actionTimestamp: new Date(),
        deviceId
      });

      return {
        success: true,
        message: "Passkey verfied successfully!!",
        data: {
          valid: true
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
}
