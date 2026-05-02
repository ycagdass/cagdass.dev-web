import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.match(/^\/articles\/([^/]+)$/)?.[1];

  if (!slug) return NextResponse.next();

  try {
    const contentUrl =
      process.env.INTERNAL_SITE_CONTENT_URL || "http://127.0.0.1:3000/api/site-content";
    const response = await fetch(contentUrl, { cache: "no-store" });

    if (!response.ok) return NextResponse.next();

    const content = await response.json();
    const articlesEnabled = content?.sections?.articlesEnabled !== false;
    const articles = Array.isArray(content?.articles?.items) ? content.articles.items : [];
    const articleExists =
      articlesEnabled &&
      articles.some((article) => article?.slug === slug && article?.published !== false);

    if (articleExists) return NextResponse.next();
  } catch {
    return NextResponse.next();
  }

  return new NextResponse("Yazı bulunamadı.", {
    status: 404,
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}

export const config = {
  matcher: ["/articles/:slug"],
};
