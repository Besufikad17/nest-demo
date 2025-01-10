import { Injectable } from "@nestjs/common";
import { IWebAuthnCredentialRepository } from "../interfaces/web-authn-credential.repository.interface";
import { PrismaService } from "src/prisma/prisma.service";
import { WebAuthnCredential, Prisma } from "@prisma/client";

@Injectable()
export class WebAuthnCredentialRepository implements IWebAuthnCredentialRepository {
  constructor(private prisma: PrismaService) { }

  async createWebAuthnCredential(createWebAuthnCredentialArgs: Prisma.WebAuthnCredentialCreateArgs): Promise<WebAuthnCredential> {
    return await this.prisma.webAuthnCredential.create(createWebAuthnCredentialArgs);
  }

  async findWebAuthCredentials(findWebAuthnCredentialsArgs: Prisma.WebAuthnCredentialFindManyArgs): Promise<WebAuthnCredential[]> {
    return await this.prisma.webAuthnCredential.findMany(findWebAuthnCredentialsArgs);
  }

  async findWebAuthnCredential(findWebAuthCredentialArgs: Prisma.WebAuthnCredentialFindFirstArgs): Promise<WebAuthnCredential | null> {
    return await this.prisma.webAuthnCredential.findFirst(findWebAuthCredentialArgs);
  }
}
