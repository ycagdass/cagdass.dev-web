import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cagdass.dev",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "https://cagdass.dev",
    NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL || "https://cagdass.dev",
  },
  htmlLimitedBots: /.*/,
  reactStrictMode: false
};

export default nextConfig;
