import { AuthenticatorTransportFuture } from "@simplewebauthn/server";

export function parseTransportsToFutureArray(csvString: string | null): AuthenticatorTransportFuture[] {
  if (!csvString) return [];

  const validTransports: Set<AuthenticatorTransportFuture> = new Set([
    "ble",
    "cable",
    "hybrid",
    "internal",
    "nfc",
    "smart-card",
    "usb",
  ]);

  return csvString
    .split(",")
    .map((transport) => transport.trim()) // Remove extra spaces
    .filter((transport): transport is AuthenticatorTransportFuture =>
      validTransports.has(transport as AuthenticatorTransportFuture)
    );
}
