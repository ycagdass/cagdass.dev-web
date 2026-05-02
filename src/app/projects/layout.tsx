import { Metadata } from "next";
import { defaultMetadata } from "@/config/metadata";

const seoData = {
  title: "Projeler",
  description: "Yusuf Çağdaş'ın yazılım, elektronik ve 3D tasarım projeleri.",
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

export default function ProjectsLayout({
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
