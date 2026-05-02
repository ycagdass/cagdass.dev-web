import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/cmsAuth";
import { verifyCloudflareAccess } from "@/lib/cloudflareAccess";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!verifyCloudflareAccess(request)) {
    return NextResponse.json({ message: "Cloudflare Access doğrulaması gerekli." }, { status: 403 });
  }

  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
