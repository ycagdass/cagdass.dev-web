import { NextRequest, NextResponse } from "next/server";
import {
  createAdminSession,
  getAdminUsername,
  isAdminTotpConfigured,
  verifyAdminPassword,
  verifyAdminTotpCode,
} from "@/lib/cmsAuth";
import { verifyCloudflareAccess } from "@/lib/cloudflareAccess";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!verifyCloudflareAccess(request)) {
    return NextResponse.json({ message: "Cloudflare Access doğrulaması gerekli." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(request, {
    scope: "cms-login",
    limit: Number(process.env.ADMIN_LOGIN_RATE_LIMIT || 5),
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Çok fazla deneme. Biraz bekleyip tekrar dene." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfter) },
      }
    );
  }

  const body = await request.json().catch(() => null);
  const username = String(body?.username || "");
  const password = String(body?.password || "");
  const totpCode = String(body?.totpCode || "");

  if (!isAdminTotpConfigured()) {
    return NextResponse.json(
      { message: "Admin doğrulama kodu yapılandırılmamış." },
      { status: 500 }
    );
  }

  if (
    username !== getAdminUsername() ||
    !verifyAdminPassword(password) ||
    !verifyAdminTotpCode(totpCode)
  ) {
    return NextResponse.json(
      { message: "Kullanıcı adı, şifre veya doğrulama kodu hatalı." },
      { status: 401 }
    );
  }

  try {
    await createAdminSession();
  } catch {
    return NextResponse.json(
      { message: "Admin oturum anahtarı yapılandırılmamış." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
