"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  ArrowUpRight,
  Boxes,
  Code2,
  Cpu,
  ExternalLink,
  FolderGit2,
  Github,
  Star,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSiteContent } from "@/hooks/useSiteContent";
import { EditableProject } from "@/lib/siteContentShared";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { y: 22, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 260, damping: 26 },
  },
};

export default function ProjectsPage() {
  const content = useSiteContent();
  const projects = content.projects.items.filter((project) => project.published !== false);
  const reduceMotion = useReducedMotion();

  const stats = useMemo(
    () => [
      { label: "Alan", value: "3", icon: Sparkles },
      { label: "Proje", value: String(projects.length), icon: FolderGit2 },
      { label: "Odak", value: "STEM", icon: Cpu },
    ],
    [projects.length]
  );

  return (
    <main className="min-h-screen bg-background">
      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8 grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end"
        >
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
              <FolderGit2 className="h-4 w-4 text-primary" />
              {content.site.brand} lab
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              {content.projects.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              {content.projects.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg border border-border bg-card p-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-md bg-background px-3 py-4 text-center"
              >
                <stat.icon className="mx-auto mb-2 h-4 w-4 text-primary" />
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id || project.title}
              project={project}
              index={index}
              reduceMotion={Boolean(reduceMotion)}
            />
          ))}
        </motion.div>
      </section>
    </main>
  );
}

function ProjectCard({
  project,
  index,
  reduceMotion,
}: {
  project: EditableProject;
  index: number;
  reduceMotion: boolean;
}) {
  const iconList = [Code2, Cpu, Boxes];
  const Icon = iconList[index % iconList.length];

  return (
    <motion.article
      variants={itemVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className="group flex min-h-[310px] flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-colors hover:border-primary/40"
    >
          {project.imageUrl && (
        <div className="relative aspect-video w-full bg-muted">
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>

          <div className="flex items-center gap-2">
            {project.source === "github" && (
              <Badge className="rounded-md" variant="secondary">
                GitHub
              </Badge>
            )}
            <Badge className="rounded-md" variant={project.featured ? "default" : "secondary"}>
              {project.category}
            </Badge>
          </div>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {project.title}
          </h2>
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
            {project.description}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="secondary" className="rounded-md text-xs">
              {tech}
            </Badge>
          ))}
        </div>

        {(project.stars || project.updatedAt) && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {Boolean(project.stars) && (
              <span className="inline-flex items-center gap-1">
                <Star className="h-3.5 w-3.5" />
                {project.stars}
              </span>
            )}
            {project.updatedAt && <span>Güncellendi: {formatDate(project.updatedAt)}</span>}
          </div>
        )}

        <div className="mt-6 flex gap-2">
          {project.github && (
            <Button variant="outline" size="sm" asChild>
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </Button>
          )}

          {project.website && (
            <Button size="sm" asChild>
              <a href={project.website} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                Site
              </a>
            </Button>
          )}

          {!project.github && !project.website && (
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              Geliştiriliyor
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "numeric" });
}
