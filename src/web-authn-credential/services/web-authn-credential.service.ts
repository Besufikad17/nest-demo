import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IWebAuthnCredentialService } from "../interfaces/web-authn-credential.service.interface";
import { IWebAuthnCredentialRepository } from "../interfaces/web-authn-credential.repository.interface";
import { WebAuthnCredential } from "generated/prisma/client"
import { CreateWebAuthnCredentialDto, FindWebAuthnCredentialDto } from "../dto/web-authn-credential.dto";
import { AuthenticatorTransportFuture } from "@simplewebauthn/server";

@Injectable()
export class WebAuthnCredentialService implements IWebAuthnCredentialService {
  constructor(private webAuthnCredentialRepository: IWebAuthnCredentialRepository) { }

  async createWebAuthnCredential(createWebAuthnCredentialDto: CreateWebAuthnCredentialDto): Promise<WebAuthnCredential> {
    const { credentialId, publicKey, transports, userId, ...createWebAuthnCredentialDtoRemainingFields } = createWebAuthnCredentialDto;

    try {
      return await this.webAuthnCredentialRepository.createWebAuthnCredential({
        data: {
          ...createWebAuthnCredentialDtoRemainingFields,
          userId: userId as never,
          credentialId: credentialId.slice(0),
          publicKey: publicKey.slice(0),
          transports: (transports as AuthenticatorTransportFuture)
        }
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

  async findWebAuthCredentials(userId: string): Promise<WebAuthnCredential[]> {
    try {
      return await this.webAuthnCredentialRepository.findWebAuthCredentials({
        where: {
          userId: userId
        }
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

  async findWebAuthnCredential(findWebAuthCredentialDto: FindWebAuthnCredentialDto): Promise<WebAuthnCredential | null> {
    const { userId, credentialId } = findWebAuthCredentialDto;

    try {
      return await this.webAuthnCredentialRepository.findWebAuthnCredential({
        where: {
          userId,
          credentialId: credentialId.slice(0)
        }
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
