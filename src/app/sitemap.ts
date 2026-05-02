import { MetadataRoute } from "next"
import { readSiteContent } from "@/lib/siteContent"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cagdass.dev"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const regularRoutes = ["/", "/articles", "/projects", "/about"].map(
        (route) => ({
            url: `${baseUrl}${route}`,
            lastModified: new Date(),
            changeFrequency: "monthly" as const,
            priority: route === "/" ? 1 : 0.8,
        })
    );
    const content = await readSiteContent();
    const articleRoutes = content.articles.items
        .filter((article) => article.published !== false)
        .map((article) => ({
            url: `${baseUrl}/articles/${article.slug}`,
            lastModified: new Date(article.date || Date.now()),
            changeFrequency: "monthly" as const,
            priority: 0.7,
        }));

    return [...regularRoutes, ...articleRoutes]
}
