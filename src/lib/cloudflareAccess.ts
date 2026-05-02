import { NextRequest } from "next/server";

export function verifyCloudflareAccess(request: NextRequest) {
  if (process.env.CF_ACCESS_REQUIRED !== "true") {
    return true;
  }

  const assertion = request.headers.get("cf-access-jwt-assertion");
  if (!assertion) {
    return false;
  }

  const allowedEmails = (process.env.CF_ACCESS_ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length === 0) {
    return true;
  }

  const email = request.headers.get("cf-access-authenticated-user-email")?.toLowerCase();
  return Boolean(email && allowedEmails.includes(email));
}
