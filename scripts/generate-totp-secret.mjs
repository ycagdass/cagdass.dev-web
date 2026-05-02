import crypto from "crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer) {
  let bits = "";
  let output = "";

  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }

  for (let offset = 0; offset < bits.length; offset += 5) {
    const chunk = bits.slice(offset, offset + 5).padEnd(5, "0");
    output += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }

  return output;
}

const issuer = process.argv[2] || "cagdass.dev";
const account = process.argv[3] || process.env.ADMIN_USERNAME || "admin";
const secret = base32Encode(crypto.randomBytes(20));
const label = `${issuer}:${account}`;
const otpauthUrl = new URL(`otpauth://totp/${encodeURIComponent(label)}`);

otpauthUrl.searchParams.set("secret", secret);
otpauthUrl.searchParams.set("issuer", issuer);
otpauthUrl.searchParams.set("algorithm", "SHA1");
otpauthUrl.searchParams.set("digits", "6");
otpauthUrl.searchParams.set("period", "30");

console.log(`ADMIN_TOTP_SECRET=${secret}`);
console.log(`OTPAUTH_URL=${otpauthUrl.toString()}`);
