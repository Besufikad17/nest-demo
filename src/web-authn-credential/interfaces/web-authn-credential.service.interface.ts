import { CreateWebAuthnCredentialDto, FindWebAuthnCredentialDto } from "../dto/web-authn-credential.dto";
import { WebAuthnCredential } from "@prisma/client";

export abstract class IWebAuthnCredentialService {
  abstract createWebAuthnCredential(createWebAuthnCredentialDto: CreateWebAuthnCredentialDto): Promise<WebAuthnCredential>;
  abstract findWebAuthCredentials(userId: string): Promise<WebAuthnCredential[]>;
  abstract findWebAuthnCredential(findWebAuthCredentialDto: FindWebAuthnCredentialDto): Promise<WebAuthnCredential | null>;
}
