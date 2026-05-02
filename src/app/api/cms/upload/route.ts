import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/cmsAuth";
import { verifyCloudflareAccess } from "@/lib/cloudflareAccess";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateImageUpload } from "@/lib/imageValidation";

export const dynamic = "force-dynamic";

const maxSize = 5 * 1024 * 1024;

function extensionFor(type: string, name: string) {
  const fromName = path.extname(name).toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp", ".avif", ".gif", ".svg"].includes(fromName)) return fromName;
  if (type === "image/png") return ".png";
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/webp") return ".webp";
  if (type === "image/avif") return ".avif";
  if (type === "image/gif") return ".gif";
  if (type === "image/svg+xml") return ".svg";
  return "";
}

export async function POST(request: NextRequest) {
  if (!verifyCloudflareAccess(request)) {
    return NextResponse.json({ message: "Cloudflare Access doğrulaması gerekli." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(request, {
    scope: "cms-upload",
    limit: Number(process.env.ADMIN_UPLOAD_RATE_LIMIT || 10),
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Çok fazla yükleme denemesi. Biraz bekleyip tekrar dene." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfter) } }
    );
  }

  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Yetkisiz." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Dosya bulunamadı." }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = extensionFor(file.type, file.name);
  const filename = `${Date.now()}-${crypto.randomUUID()}${ext}`;
  const target = path.join(uploadDir, filename);
  const bytes = Buffer.from(await file.arrayBuffer());
  const validationError = await validateImageUpload(file, bytes);

  if (validationError || bytes.length > maxSize) {
    return NextResponse.json(
      { message: validationError || "Görsel 5 MB altında olmalı." },
      { status: 400 }
    );
  }

  await fs.writeFile(target, bytes);
  return NextResponse.json({ url: `/uploads/${filename}` });
}
