"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";

export default function Home() {
  const { t } = useTranslation("home");
  const content = useSiteContent();
  const reduceMotion = useReducedMotion();
  const enableTypewriter = content.home.enableTypewriter === true;
  const typewriterWords = content.home.typewriterWords.length
    ? content.home.typewriterWords
    : [content.home.titleLine2 || t("hero.2")];
  const [wordIndex, setWordIndex] = useState(0);
  const activeSecondLine = typewriterWords[wordIndex % typewriterWords.length] || content.home.titleLine2 || t("hero.2");
  const titleText = useMemo(
    () => {
      if (!enableTypewriter) return content.home.heroTitle || "Yusuf Çağdaş'ın dünyasına hoş geldin";

      return `${content.home.titleLine1 || t("hero.1")}\n${activeSecondLine}`;
    },
    [activeSecondLine, content.home.heroTitle, content.home.titleLine1, enableTypewriter, t]
  );
  const [typedTitle, setTypedTitle] = useState(titleText);

  useEffect(() => {
    if (!enableTypewriter || reduceMotion || typewriterWords.length <= 1) return;

    const timeout = window.setTimeout(() => {
      setWordIndex((current) => (current + 1) % typewriterWords.length);
    }, 2600);

    return () => window.clearTimeout(timeout);
  }, [enableTypewriter, reduceMotion, typewriterWords.length]);

  useEffect(() => {
    if (!enableTypewriter || reduceMotion) {
      setTypedTitle(titleText);
      return;
    }

    setTypedTitle("");
    let index = 0;
    const interval = window.setInterval(() => {
      index += 1;
      setTypedTitle(titleText.slice(0, index));
      if (index >= titleText.length) window.clearInterval(interval);
    }, 34);

    return () => window.clearInterval(interval);
  }, [enableTypewriter, reduceMotion, titleText]);

  const heroButtons = [
    {
      text: content.home.primaryButtonLabel || t("heroButtons.aboutMe"),
      href: content.home.primaryButtonHref || "/about",
      variant: "default",
      size: "lg",
      visible: content.sections.aboutEnabled,
    },
    {
      text: content.home.secondaryButtonLabel || t("heroButtons.viewProjects"),
      href: content.home.secondaryButtonHref || "/projects",
      variant: "secondary",
      size: "lg",
      visible: content.sections.projectsEnabled,
    },
    {
      text: content.home.articlesButtonLabel || t("heroButtons.readArticles"),
      href: content.home.articlesButtonHref || "/articles",
      variant: "secondary",
      size: "lg",
      visible: content.sections.articlesEnabled,
    },
  ].filter((button) => button.visible);
  const titleLines = typedTitle.split("\n").filter((line) => line.length > 0);

  return (
      <main className="flex min-h-screen flex-col bg-background">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="space-y-8 sm:space-y-12 py-6 sm:py-8 md:py-12 lg:py-16">
            <div className="animate-fadeIn">
              <section className="container relative min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 md:px-8 lg:px-12 py-6 md:py-18 lg:py-30">
                <div className="mx-auto max-w-5xl flex flex-col items-center text-center space-y-8 md:space-y-10 lg:space-y-12">
                  <motion.h1
                      initial={reduceMotion ? false : { opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.8,
                        ease: "easeInOut",
                      }}
                      className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter leading-tight"
                  >
                  {titleLines.map((line, index) => (
                    <span key={`${line}-${index}`} className="bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent hover:from-primary/90 hover:to-primary transition-colors duration-300">
                      {index > 0 && <br />}
                      {line}
                    </span>
                  ))}
                    {!reduceMotion && typedTitle.length < titleText.length && (
                      <span className="ml-1 inline-block h-[0.85em] w-[0.08em] translate-y-[0.08em] bg-primary" />
                    )}
                  </motion.h1>

                  <motion.p
                      initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.3,
                        duration: 0.6,
                        ease: "easeOut",
                      }}
                      className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-[90%] sm:max-w-[85%] md:max-w-[80%] lg:max-w-[75%] leading-relaxed"
                  >
                    {content.home.heroDescription || content.home.description || t("desc")}
                  </motion.p>

                  <AnimatePresence>
                    {heroButtons && heroButtons.length > 0 && (
                        <motion.div
                            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: 0.5,
                              duration: 0.6,
                              ease: "easeOut",
                            }}
                            className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-6 md:mt-8 lg:mt-10 w-full sm:w-auto"
                        >
                          {heroButtons.map((button, index) => (
                              <Button
                                  key={index}
                                  asChild
                                  size={(button.size as any) || "lg"}
                                  variant={(button.variant as any) || "default"}
                                  className="w-full sm:w-auto transform hover:scale-105 transition-transform duration-200"
                              >
                                <Link href={button.href}>{button.text}</Link>
                              </Button>
                          ))}
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
  );
}
