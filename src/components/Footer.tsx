"use client";

import React, { Suspense } from "react";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  GithubIcon,
  InstagramIcon,
  TelegramIcon,
} from "@hugeicons/core-free-icons";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Footer() {
  const content = useSiteContent();
  const socialLinks = [
    { label: "GitHub", href: content.site.githubUrl, icon: GithubIcon },
    { label: "Telegram", href: content.site.telegramUrl, icon: TelegramIcon },
    { label: "Instagram", href: content.site.instagramUrl, icon: InstagramIcon },
  ].filter((link) => link.href.trim());

  return (
    <Suspense fallback={null}>
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative border-t border-border bg-background"
      >
        <div className="absolute inset-0 pointer-events-none" />

        <div className="relative container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                {content.site.footerText || "© 2026 Yusuf Çağdaş. Tüm hakları saklıdır."}
              </p>
              {socialLinks.length > 0 && (
                <div className="flex items-center gap-4">
                  {socialLinks.map((link) => (
                    <motion.a
                      key={link.label}
                      whileHover={{ y: -3 }}
                      href={link.href}
                      className="text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={link.label}
                      title={link.label}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <HugeiconsIcon icon={link.icon} className="h-5 w-5" />
                    </motion.a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.footer>
    </Suspense>
  );
}
