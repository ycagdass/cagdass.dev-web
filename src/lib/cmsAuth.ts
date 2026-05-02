import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ycg_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const TOTP_PERIOD_SECONDS = 30;
const TOTP_DIGITS = 6;
const TOTP_ALLOWED_WINDOW = 1;
const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "";
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("hex");
}

export function hashAdminPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyAdminPassword(password: string) {
  const configuredHash = process.env.ADMIN_PASSWORD_HASH;
  const plainPassword = process.env.ADMIN_PASSWORD;

  if (configuredHash?.startsWith("scrypt:")) {
    const [, salt, expected] = configuredHash.split(":");
    const actual = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(Buffer.from(expected, "hex"), actual);
  }

  if (plainPassword) {
    const actual = Buffer.from(password);
    const expected = Buffer.from(plainPassword);
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  }

  return false;
}

function decodeBase32(value: string) {
  const normalized = value.replace(/[\s=-]/g, "").toUpperCase();
  let bits = "";
  const bytes: number[] = [];

  for (const char of normalized) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error("Invalid base32 value");
    bits += index.toString(2).padStart(5, "0");
  }

  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }

  return Buffer.from(bytes);
}

function generateTotp(secret: Buffer, counter: number) {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));

  const hmac = crypto.createHmac("sha1", secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

function timingSafeStringEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function isAdminTotpConfigured() {
  return Boolean(process.env.ADMIN_TOTP_SECRET?.trim());
}

export function verifyAdminTotpCode(code: string) {
  const configuredSecret = process.env.ADMIN_TOTP_SECRET?.trim();
  const normalizedCode = code.replace(/\s/g, "");

  if (!configuredSecret || !/^\d{6}$/.test(normalizedCode)) return false;

  let secretBuffer: Buffer;
  try {
    secretBuffer = decodeBase32(configuredSecret);
  } catch {
    return false;
  }

  const currentCounter = Math.floor(Date.now() / 1000 / TOTP_PERIOD_SECONDS);
  for (let windowOffset = -TOTP_ALLOWED_WINDOW; windowOffset <= TOTP_ALLOWED_WINDOW; windowOffset += 1) {
    const expectedCode = generateTotp(secretBuffer, currentCounter + windowOffset);
    if (timingSafeStringEqual(normalizedCode, expectedCode)) return true;
  }

  return false;
}

export async function createAdminSession() {
  if (!secret()) throw new Error("ADMIN_SESSION_SECRET is not configured");

  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = Buffer.from(JSON.stringify({ expiresAt })).toString("base64url");
  const token = `${payload}.${sign(payload)}`;
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function isAdminAuthenticated() {
  if (!secret()) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature || sign(payload) !== signature) return false;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof parsed.expiresAt === "number" && parsed.expiresAt > Date.now();
  } catch {
    return false;
  }
}

export function getAdminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}
