import "server-only";

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";

function getEncryptionSecret() {
  const secret = process.env.FACEBOOK_TOKEN_ENCRYPTION_KEY;

  if (!secret) {
    throw new Error("Missing FACEBOOK_TOKEN_ENCRYPTION_KEY.");
  }

  return secret;
}

function deriveKey(secret: string) {
  return createHash("sha256").update(secret).digest();
}

export function hasEncryptionSecret() {
  return Boolean(process.env.FACEBOOK_TOKEN_ENCRYPTION_KEY);
}

export function encryptSecret(value: string) {
  const secret = getEncryptionSecret();
  const iv = randomBytes(12);
  const key = deriveKey(secret);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return [iv.toString("base64url"), tag.toString("base64url"), encrypted.toString("base64url")].join(".");
}

export function decryptSecret(value: string) {
  const secret = getEncryptionSecret();
  const [ivRaw, tagRaw, encryptedRaw] = value.split(".");

  if (!ivRaw || !tagRaw || !encryptedRaw) {
    throw new Error("Invalid encrypted value.");
  }

  const key = deriveKey(secret);
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));

  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedRaw, "base64url")), decipher.final()]);

  return decrypted.toString("utf8");
}
