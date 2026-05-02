import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cmsAuth";
import { verifyCloudflareAccess } from "@/lib/cloudflareAccess";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyCloudflareAccess(request)) {
    return NextResponse.json({ authenticated: false }, { status: 403 });
  }

  return NextResponse.json({ authenticated: await isAdminAuthenticated() });
}
