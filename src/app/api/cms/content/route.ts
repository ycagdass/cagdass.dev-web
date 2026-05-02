import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cmsAuth";
import { readSiteContent, writeSiteContent } from "@/lib/siteContent";
import { SiteContent } from "@/lib/siteContentShared";
import { verifyCloudflareAccess } from "@/lib/cloudflareAccess";
import { checkRateLimit } from "@/lib/rateLimit";
import { enrichSiteContentWithGithubProjects } from "@/lib/githubProjects";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!verifyCloudflareAccess(request)) {
    return NextResponse.json({ message: "Cloudflare Access doğrulaması gerekli." }, { status: 403 });
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Yetkisiz." }, { status: 401 });
  }

  return NextResponse.json(await enrichSiteContentWithGithubProjects(await readSiteContent()));
}

export async function PUT(request: NextRequest) {
  if (!verifyCloudflareAccess(request)) {
    return NextResponse.json({ message: "Cloudflare Access doğrulaması gerekli." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(request, {
    scope: "cms-save",
    limit: Number(process.env.ADMIN_SAVE_RATE_LIMIT || 30),
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Çok sık kayıt yapılıyor. Biraz bekleyip tekrar dene." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Yetkisiz." }, { status: 401 });
  }

  const content = (await request.json().catch(() => null)) as SiteContent | null;
  if (!content?.site || !content.home || !content.about || !content.projects) {
    return NextResponse.json({ message: "Geçersiz içerik." }, { status: 400 });
  }

  await writeSiteContent(content);
  return NextResponse.json({ ok: true });
}
