"use client";

import { useMemo, useState, useEffect, Suspense } from "react";
import { useTranslation } from "react-i18next";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CodeIcon,
  DatabaseIcon,
  StarIcon,
  FireIcon,
  UserGroupIcon,
  CodeFolderIcon, GithubIcon, TelegramIcon, SpotifyIcon, NewTwitterIcon, InstagramIcon, Coffee01Icon,
  DartIcon,
} from "@hugeicons/core-free-icons";
import { motion } from "framer-motion";
import {
  AboutCard_AboutMe, AboutCard_Contact,
  AboutCard_Skills,
} from "@/components/about/ContentCards";
import { Card, CardContent } from "@/components/ui/card";
import {containerVariants} from "@/components/about/MotionSpecs";
import {ProfileCard} from "@/components/about/ProfileCard";
import {DiJava} from "react-icons/di";
import {
  BlenderOriginal,
  COriginal,
  DockerOriginal,
  FirebaseOriginal,
  GitOriginal,
  NodejsOriginal,
  PostgresqlOriginal,
  PythonOriginal,
  ReactOriginal,
  VscodeOriginal,
} from "devicons-react";
import {useSiteContent} from "@/hooks/useSiteContent";
import { EditableTechnology, isRenderableImageUrl } from "@/lib/siteContentShared";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const {t} = useTranslation("about");
  const content = useSiteContent();
  const skills = useMemo(
    () =>
      content.technologies.items
        .filter((technology) => technology.visible !== false)
        .map(technologyToSkill),
    [content.technologies.items]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // @ts-ignore
  return (
      <Suspense>
        <motion.div
            className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
          <motion.div
              className="container mx-auto flex max-w-4xl flex-col items-center px-4 pt-16 pb-4 text-center"
              variants={containerVariants}
          >
            <ProfileCard t={t} socialLinks={[
              {
                icon: <HugeiconsIcon icon={GithubIcon} className="h-4 w-4" />,
                url: content.site.githubUrl,
              },
              {
                icon: <HugeiconsIcon icon={TelegramIcon} className="h-4 w-4" />,
                url: content.site.telegramUrl,
              },
              {
                icon: <HugeiconsIcon icon={InstagramIcon} className="h-4 w-4" />,
                url: content.site.instagramUrl,
              },
            ]} />

            <AboutCard_AboutMe t={t} aboutText={content.about.body} classNameVal="mb-4 w-full max-w-2xl"/>
            {content.sections.technologiesEnabled && (
              <AboutCard_Skills
                t={t}
                classNameVal="mb-4 w-full max-w-2xl"
                skills={skills}
                title={content.technologies.title}
              />
            )}
            <AboutDetails content={content} />
            <AboutCard_Contact
              t={t}
              classNameVal="mb-4 grid w-full max-w-2xl gap-4 md:grid-cols-2"
              email={content.site.email}
              telegramUrl={content.site.telegramUrl}
            />
          </motion.div>
        </motion.div>
      </Suspense>
  );
}

const technologyIcons: Record<string, any> = {
  c: COriginal,
  python: PythonOriginal,
  react: ReactOriginal,
  nodejs: NodejsOriginal,
  vscode: VscodeOriginal,
  git: GitOriginal,
  blender: BlenderOriginal,
  docker: DockerOriginal,
  postgresql: PostgresqlOriginal,
  firebase: FirebaseOriginal,
  java: DiJava,
};

function technologyToSkill(technology: EditableTechnology) {
  const iconKey = technology.iconKey.trim().toLowerCase();
  const icon = technologyIcons[iconKey];
  const iconUrl = isRenderableImageUrl(technology.iconUrl)
    ? technology.iconUrl
    : isRenderableImageUrl(technology.iconKey)
      ? technology.iconKey
      : undefined;

  return {
    name: technology.name,
    icon,
    iconUrl,
    description: technology.description,
  };
}

function AboutDetails({ content }: { content: ReturnType<typeof useSiteContent> }) {
  const details = [
    { title: "Yetenekler", value: content.about.skills.join(", ") },
    { title: "Deneyim", value: content.about.experience },
    { title: "Eğitim", value: content.about.education },
    { title: "Sertifikalar", value: content.about.certifications },
  ].filter((item) => item.value.trim());

  if (details.length === 0) return null;

  return (
    <motion.div className="mb-4 grid w-full max-w-2xl gap-4 md:grid-cols-2" variants={containerVariants}>
      {details.map((detail) => (
        <Card key={detail.title} className="p-5">
          <CardContent className="space-y-2 p-0 text-left">
            <h4 className="text-sm font-semibold">{detail.title}</h4>
            <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">{detail.value}</p>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
}
