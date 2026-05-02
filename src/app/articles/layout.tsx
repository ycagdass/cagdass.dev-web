import { Metadata } from "next";
import { defaultMetadata } from "@/config/metadata";

const seoData = {
  title: "Yazılar",
  description: "Yusuf Çağdaş'ın yazıları için ayrılan bölüm.",
  bannerUrl: "/ycagdass-logo.png"
}

export const metadata: Metadata = {
  ...defaultMetadata,
  title: seoData.title,
  description: seoData.description,
  openGraph: {
    title: seoData.title,
    description: seoData.description,
    locale: "en_US",
    images: [
      { url: seoData.bannerUrl, width: 1024, height: 558, alt: seoData.title, type: "image/png" },
    ]
  },
  twitter: {
    card: "summary_large_image",
    site: "@ycagdass",
    title: seoData.title,
    creator: "@ycagdass",
    description: seoData.description,
    images: [seoData.bannerUrl]
  }
};

export default function ArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-primary-foreground dark:bg-primary-background">
      {children}
    </div>
  );
}
