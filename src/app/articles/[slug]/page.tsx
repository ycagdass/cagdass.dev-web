import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { SafeArticleImage } from "@/components/articles/SafeArticleImage";
import { readSiteContent } from "@/lib/siteContent";
import { EditableArticle, isRenderableImageUrl } from "@/lib/siteContentShared";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cagdass.dev";

export const dynamic = "force-dynamic";

async function getArticle(slug: string) {
  const content = await readSiteContent();

  if (!content.sections.articlesEnabled) return null;

  return (
    content.articles.items.find(
      (article) => article.slug === slug && article.published !== false
    ) || null
  );
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "Yazı bulunamadı",
    };
  }

  const description = article.excerpt || article.content.slice(0, 150);
  const images = articleImages(article);

  return {
    title: article.title,
    description,
    openGraph: {
      title: article.title,
      description,
      type: "article",
      url: `${baseUrl}/articles/${article.slug}`,
      publishedTime: article.date,
      images: images.length > 0 ? images : ["/ycagdass-logo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description,
      images: images.length > 0 ? images : ["/ycagdass-logo.png"],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) notFound();

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/articles"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ArrowLeft className="h-4 w-4" />
          Yazılara dön
        </Link>

        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            {article.category && <Badge className="rounded-md">{article.category}</Badge>}
            {article.featured && <Badge variant="secondary" className="rounded-md">Öne çıkan</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            {article.title}
          </h1>
          <ArticleMeta article={article} />
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-md text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {isRenderableImageUrl(article.imageUrl) && (
          <div className="relative mt-8 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
            <SafeArticleImage
              src={article.imageUrl || ""}
              alt={article.title}
              priority
            />
          </div>
        )}

        <div className="mt-8 space-y-5 text-base leading-8 text-foreground/85">
          {renderContent(article)}
        </div>

        <ArticleGallery article={article} />
      </article>
    </main>
  );
}

function articleImages(article: EditableArticle) {
  return [article.imageUrl, ...(article.imageUrls || [])]
    .filter((url): url is string => isRenderableImageUrl(url))
    .filter((url, index, items) => items.indexOf(url) === index);
}

function ArticleGallery({ article }: { article: EditableArticle }) {
  const images = articleImages(article).filter((url) => url !== article.imageUrl);

  if (images.length === 0) return null;

  return (
    <div className="mt-10 grid gap-4 sm:grid-cols-2">
      {images.map((url, index) => (
        <div key={url} className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
          <SafeArticleImage src={url} alt={`${article.title} görsel ${index + 1}`} />
        </div>
      ))}
    </div>
  );
}

function ArticleMeta({ article }: { article: EditableArticle }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="h-4 w-4" />
        {article.date}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock className="h-4 w-4" />
        {article.readingTime}
      </span>
    </div>
  );
}

function renderContent(article: EditableArticle) {
  const paragraphs = (article.content || article.excerpt)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return <p>Bu yazı için içerik henüz eklenmedi.</p>;
  }

  return paragraphs.map((paragraph, index) => (
    <p key={index} className="whitespace-pre-line">
      {paragraph}
    </p>
  ));
}
