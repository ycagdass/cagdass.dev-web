"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableArticle, isRenderableImageUrl } from "@/lib/siteContentShared";

export default function ArticlesPage() {
  const content = useSiteContent();
  const articles = useMemo(
    () =>
      content.articles.items
        .filter((article) => article.published !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [content.articles.items]
  );

  return (
    <main className="min-h-screen bg-background px-4 py-12">
      <section className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 max-w-2xl"
        >
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BookOpen className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {content.articles.title}
          </h1>
          <p className="mt-4 text-muted-foreground">
            {content.sections.articlesEnabled
              ? content.articles.description
              : "Yazılar bölümü şu anda kapalı. İstersen admin panelinden tekrar açabilirsin."}
          </p>
        </motion.div>

        {content.sections.articlesEnabled && articles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <ArticleCard key={article.id || article.slug} article={article} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
            {content.sections.articlesEnabled ? "Henüz yayında yazı yok." : "Yazılar kapalı."}
          </div>
        )}
      </section>
    </main>
  );
}

function ArticleCard({ article }: { article: EditableArticle }) {
  const href = `/articles/${article.slug}`;

  return (
    <Link href={href} className="group block h-full rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <Card className="h-full overflow-hidden transition-colors group-hover:border-primary/60">
        <ArticleImage article={article} />
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            {article.category && <Badge className="rounded-md">{article.category}</Badge>}
            {article.featured && <Badge variant="secondary" className="rounded-md">Öne çıkan</Badge>}
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary">{article.title}</h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
              {article.excerpt || article.content}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-md text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              {article.date}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {article.readingTime}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function ArticleImage({ article }: { article: EditableArticle }) {
  const [failed, setFailed] = useState(false);

  if (failed || !isRenderableImageUrl(article.imageUrl)) return null;

  return (
    <div className="relative aspect-video bg-muted">
      <Image
        src={article.imageUrl || ""}
        alt={article.title}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}
