import { WebAuthnCredential, Prisma } from "generated/prisma/client";

export abstract class IWebAuthnCredentialRepository {
  abstract createWebAuthnCredential(createWebAuthnCredentialArgs: Prisma.WebAuthnCredentialCreateArgs): Promise<WebAuthnCredential>;
  abstract findWebAuthCredentials(findWebAuthnCredentialsArgs: Prisma.WebAuthnCredentialFindManyArgs): Promise<WebAuthnCredential[]>;
  abstract findWebAuthnCredential(findWebAuthCredentialArgs: Prisma.WebAuthnCredentialFindFirstArgs): Promise<WebAuthnCredential | null>;
}
