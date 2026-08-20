import { CreateWebAuthnCredentialDto, FindWebAuthnCredentialDto, UpdateWebAuthnCredentialDto } from "../dto/web-authn-credential.dto";
import { WebAuthnCredential } from "generated/prisma/client";

export abstract class IWebAuthnCredentialService {
  abstract createWebAuthnCredential(createWebAuthnCredentialDto: CreateWebAuthnCredentialDto): Promise<WebAuthnCredential>;
  abstract findWebAuthCredentials(userId: string): Promise<WebAuthnCredential[]>;
  abstract findWebAuthnCredential(findWebAuthCredentialDto: FindWebAuthnCredentialDto): Promise<WebAuthnCredential | null>;
  abstract updateWebAuthnCredential(id: string, updateWebAuthnCredentialDto: UpdateWebAuthnCredentialDto): Promise<WebAuthnCredential>;
}
