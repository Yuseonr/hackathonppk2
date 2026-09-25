import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const PASSWORD_FORMAT = "scrypt-v1";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString("hex");
  const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  return [PASSWORD_FORMAT, salt, derivedKey.toString("hex")].join(":");
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const [format, salt, encodedHash] = storedHash.split(":");

  if (format !== PASSWORD_FORMAT || !salt || !encodedHash) {
    return false;
  }

  const expectedHash = Buffer.from(encodedHash, "hex");
  const actualHash = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

  if (expectedHash.length !== actualHash.length) {
    return false;
  }

  return timingSafeEqual(expectedHash, actualHash);
}
