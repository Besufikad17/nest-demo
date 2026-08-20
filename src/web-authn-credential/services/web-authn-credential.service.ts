import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { IWebAuthnCredentialService } from "../interfaces/web-authn-credential.service.interface";
import { IWebAuthnCredentialRepository } from "../interfaces/web-authn-credential.repository.interface";
import { WebAuthnCredential } from "generated/prisma/client";
import {
  CreateWebAuthnCredentialDto,
  FindWebAuthnCredentialDto,
  UpdateWebAuthnCredentialDto,
} from "../dto/web-authn-credential.dto";

@Injectable()
export class WebAuthnCredentialService implements IWebAuthnCredentialService {
  constructor(private webAuthnCredentialRepository: IWebAuthnCredentialRepository) { }

  async createWebAuthnCredential(
    createWebAuthnCredentialDto: CreateWebAuthnCredentialDto,
  ): Promise<WebAuthnCredential> {
    const {
      credentialId,
      publicKey,
      transports,
      userId,
      ...rest
    } = createWebAuthnCredentialDto;

    // Serialize transports array → CSV string for the DB column.
    // parseTransportsToFutureArray() in strings.ts reads it back out.
    const transportsCsv = Array.isArray(transports)
      ? transports.join(",")
      : (transports as string);

    try {
      return await this.webAuthnCredentialRepository.createWebAuthnCredential({
        data: {
          ...rest,
          userId: userId as string,
          credentialId: Buffer.from(credentialId),
          publicKey: Buffer.from(publicKey),
          transports: transportsCsv,
        },
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        error.meta || "Error occurred check the log in the server",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findWebAuthCredentials(userId: string): Promise<WebAuthnCredential[]> {
    try {
      return await this.webAuthnCredentialRepository.findWebAuthCredentials({
        where: { userId },
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        error.meta || "Error occurred check the log in the server",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findWebAuthnCredential(
    findWebAuthCredentialDto: FindWebAuthnCredentialDto,
  ): Promise<WebAuthnCredential | null> {
    const { userId, credentialId } = findWebAuthCredentialDto;

    try {
      return await this.webAuthnCredentialRepository.findWebAuthnCredential({
        where: {
          userId,
          credentialId: Buffer.from(credentialId),
        },
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        error.meta || "Error occurred check the log in the server",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateWebAuthnCredential(
    id: string,
    updateWebAuthnCredentialDto: UpdateWebAuthnCredentialDto,
  ): Promise<WebAuthnCredential> {
    try {
      return await this.webAuthnCredentialRepository.updateWebAuthnCredential({
        where: { id },
        data: updateWebAuthnCredentialDto,
      });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        throw new HttpException(error, HttpStatus.BAD_REQUEST);
      }
      throw new HttpException(
        error.meta || "Error occurred check the log in the server",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
