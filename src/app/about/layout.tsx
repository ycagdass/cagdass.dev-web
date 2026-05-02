import { Metadata } from "next";
import { defaultMetadata } from "@/config/metadata";

const seoData = {
  title: "Hakkımda",
  description: "Yusuf Çağdaş hakkında kısa bilgi, beceriler ve iletişim bağlantıları.",
  bannerUrl: "/ycagdass-logo.png",
};

export const metadata: Metadata = {
  ...defaultMetadata,
  title: seoData.title,
  description: seoData.description,
  openGraph: {
    title: seoData.title,
    description: seoData.description,
    images: [
      { url: seoData.bannerUrl, width: 1024, height: 558, alt: seoData.title, type: "image/png" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: seoData.title,
    description: seoData.description,
    images: [seoData.bannerUrl],
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="bg-primary-foreground dark:bg-primary-background">
        {children}
      </div>
    </div>
  );
}
