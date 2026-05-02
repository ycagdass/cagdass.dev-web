import { Metadata } from "next";
import { SITE_CONFIG } from "./config";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://cagdass.dev";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `Yusuf Çağdaş`,
    template: `%s`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "ycagdass",
    "github projects",
    "portfolio",
    "developer",
    "personal website",
  ],
  authors: [
    {
      name: SITE_CONFIG.name,
      url: siteUrl,
    },
  ],
  creator: SITE_CONFIG.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/ycagdass-logo.png",
    shortcut: "/ycagdass-logo.png",
    apple: "/ycagdass-logo.png",
    other: [
      {
        rel: "icon",
        type: "image/png",
        sizes: "32x32",
        url: "/ycagdass-logo.png",
      },
      {
        rel: "icon",
        type: "image/png",
        sizes: "16x16",
        url: "/ycagdass-logo.png",
      },
    ],
  },
};
