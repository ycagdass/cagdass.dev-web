export interface EditableProject {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  imageUrl?: string;
  github?: string;
  githubFullName?: string;
  website?: string;
  featured: boolean;
  published?: boolean;
  source?: "manual" | "github";
  order?: number;
  stars?: number;
  language?: string;
  updatedAt?: string;
}

export interface EditableArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl?: string;
  imageUrls?: string[];
  category: string;
  tags: string[];
  date: string;
  readingTime: string;
  language: "tr" | "en";
  featured: boolean;
  published?: boolean;
  order?: number;
}

export interface EditableTechnology {
  id: string;
  name: string;
  iconKey: string;
  iconUrl?: string;
  category: string;
  description?: string;
  visible?: boolean;
  order?: number;
}

export interface SiteContent {
  site: {
    name: string;
    brand: string;
    domain: string;
    logoUrl: string;
    profileImageUrl: string;
    githubUrl: string;
    telegramUrl: string;
    instagramUrl: string;
    email: string;
    footerText: string;
  };
  home: {
    heroTitle: string;
    heroDescription: string;
    enableTypewriter: boolean;
    titleLine1: string;
    titleLine2: string;
    typewriterWords: string[];
    description: string;
    primaryButtonLabel: string;
    primaryButtonHref: string;
    secondaryButtonLabel: string;
    secondaryButtonHref: string;
    articlesButtonLabel: string;
    articlesButtonHref: string;
  };
  about: {
    title: string;
    name: string;
    subtitle: string;
    body: string;
    profileTitle: string;
    profileSubtitle: string;
    skills: string[];
    experience: string;
    education: string;
    certifications: string;
  };
  technologies: {
    title: string;
    items: EditableTechnology[];
  };
  projects: {
    title: string;
    description: string;
    githubEnabled: boolean;
    githubUsername: string;
    includeForks: boolean;
    items: EditableProject[];
  };
  articles: {
    title: string;
    description: string;
    items: EditableArticle[];
  };
  sections: {
    articlesEnabled: boolean;
    projectsEnabled: boolean;
    aboutEnabled: boolean;
    technologiesEnabled: boolean;
  };
}

export const defaultSiteContent: SiteContent = {
  site: {
    name: "Yusuf Çağdaş",
    brand: "ycagdass",
    domain: "cagdass.dev",
    logoUrl: "/ycagdass-logo.png",
    profileImageUrl: "/ycagdass.jpg",
    githubUrl: "https://github.com/ycagdass",
    telegramUrl: "https://t.me/neurocagdas",
    instagramUrl: "https://instagram.com/cagdassme",
    email: "yusuf38cagdas@gmail.com",
    footerText: "© 2026 Yusuf Çağdaş. Tüm hakları saklıdır.",
  },
  home: {
    heroTitle: "Yusuf Çağdaş'ın dünyasına hoş geldin",
    heroDescription:
      "Yazılım, elektronik ve 3D tasarım alanlarında öğrendiklerimi projeye dönüştürdüğüm kişisel alanım.",
    enableTypewriter: false,
    titleLine1: "Yusuf Çağdaş'ın dünyasına",
    titleLine2: "hoş geldin",
    typewriterWords: ["hoş geldin"],
    description:
      "Yazılım, elektronik ve 3D tasarım alanlarında öğrendiklerimi projeye dönüştürdüğüm kişisel alanım.",
    primaryButtonLabel: "Hakkımda",
    primaryButtonHref: "/about",
    secondaryButtonLabel: "Projelerim",
    secondaryButtonHref: "/projects",
    articlesButtonLabel: "Yazılarım",
    articlesButtonHref: "/articles",
  },
  about: {
    title: "Hakkımda",
    name: "Yusuf Çağdaş",
    subtitle: "Lise öğrencisi • Yazılım • Elektronik • 3D Tasarım",
    body:
      "Ben Yusuf Çağdaş. Lise öğrencisiyim; yazılım, elektronik ve 3D tasarım alanlarında kendimi geliştiriyorum. Arduino, mikrodenetleyiciler, web teknolojileri ve CAD modelleme ile fikirlerimi çalışan prototiplere dönüştürmeyi seviyorum.",
    profileTitle: "Yusuf Çağdaş",
    profileSubtitle: "Lise öğrencisi • Yazılım • Elektronik • 3D Tasarım",
    skills: ["Yazılım", "Elektronik", "3D Tasarım"],
    experience: "",
    education: "",
    certifications: "",
  },
  technologies: {
    title: "Araçlar ve Teknolojiler",
    items: [
      { id: "c", name: "C", iconKey: "c", category: "Yazılım", visible: true },
      { id: "python", name: "Python", iconKey: "python", category: "Yazılım", visible: true },
      { id: "react", name: "React", iconKey: "react", category: "Web", visible: true },
      { id: "nodejs", name: "Node.js", iconKey: "nodejs", category: "Web", visible: true },
      { id: "vscode", name: "VS Code", iconKey: "vscode", category: "Araç", visible: true },
      { id: "git", name: "Git", iconKey: "git", category: "Araç", visible: true },
      { id: "arduino", name: "Arduino", iconKey: "https://cdn.simpleicons.org/arduino/00979d", category: "Elektronik", visible: true },
      { id: "raspberry-pi", name: "Raspberry Pi", iconKey: "https://cdn.simpleicons.org/raspberrypi/a22082", category: "Elektronik", visible: true },
      { id: "stm32", name: "STM32", iconKey: "https://cdn.simpleicons.org/stmicroelectronics/03234b", category: "Elektronik", visible: true },
      { id: "kicad", name: "KiCAD", iconKey: "https://cdn.simpleicons.org/kicad/314cb0", category: "Elektronik", visible: true },
      { id: "solidworks", name: "Solidworks", iconKey: "/solidworks-logo.svg", category: "3D Tasarım", visible: true },
      { id: "autocad", name: "AutoCAD", iconKey: "https://cdn.simpleicons.org/autodesk/1f1f1f", category: "3D Tasarım", visible: true },
      { id: "fusion-360", name: "Fusion 360", iconKey: "https://cdn.simpleicons.org/autodesk/1f1f1f", category: "3D Tasarım", visible: true },
      { id: "blender", name: "Blender", iconKey: "blender", category: "3D Tasarım", visible: true },
      { id: "docker", name: "Docker", iconKey: "docker", category: "Altyapı", visible: true },
      { id: "postgresql", name: "PostgreSQL", iconKey: "postgresql", category: "Veri", visible: true },
      { id: "firebase", name: "Firebase", iconKey: "firebase", category: "Veri", visible: true },
    ],
  },
  projects: {
    title: "Projelerim",
    description:
      "Yazılım, elektronik ve tasarım tarafında geliştirdiğim projelerden seçtiklerim.",
    githubEnabled: true,
    githubUsername: "ycagdass",
    includeForks: false,
    items: [],
  },
  articles: {
    title: "Yazılar",
    description: "Notlar, deneyimler ve öğrendiklerim.",
    items: [],
  },
  sections: {
    articlesEnabled: false,
    projectsEnabled: true,
    aboutEnabled: true,
    technologiesEnabled: true,
  },
};

export function slugify(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isRenderableImageUrl(value?: string) {
  const url = (value || "").trim();
  if (!url) return false;
  if (url.startsWith("/uploads/") || url.startsWith("/")) return !url.includes("..");

  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function cleanList(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function uniqueSlug(base: string, usedSlugs: Set<string>) {
  const fallback = "yazi";
  const root = slugify(base) || fallback;
  let slug = root;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${root}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

function normalizeArticle(article: Partial<EditableArticle>, index: number, usedSlugs: Set<string>): EditableArticle {
  const title = String(article.title || "").trim();
  const slugBase = String(article.slug || title || article.id || `yazi-${index + 1}`);

  return {
    id: String(article.id || slugify(title) || `article-${index + 1}`),
    title,
    slug: uniqueSlug(slugBase, usedSlugs),
    excerpt: String(article.excerpt || "").trim(),
    content: String(article.content || ""),
    imageUrl: isRenderableImageUrl(article.imageUrl) ? String(article.imageUrl).trim() : "",
    imageUrls: cleanList(article.imageUrls).filter(isRenderableImageUrl),
    category: String(article.category || "").trim(),
    tags: cleanList(article.tags),
    date: String(article.date || new Date().toISOString().slice(0, 10)),
    readingTime: String(article.readingTime || "1 dk"),
    language: article.language === "en" ? "en" : "tr",
    featured: Boolean(article.featured),
    published: article.published !== false,
    order: Number.isFinite(Number(article.order)) ? Number(article.order) : index,
  };
}

function normalizeTechnology(technology: Partial<EditableTechnology>, index: number): EditableTechnology {
  const idBase = technology.id || technology.name || `technology-${index + 1}`;

  return {
    id: String(idBase) || `technology-${index + 1}`,
    name: String(technology.name || "").trim(),
    iconKey: String(technology.iconKey || "").trim(),
    iconUrl: isRenderableImageUrl(technology.iconUrl) ? String(technology.iconUrl).trim() : "",
    category: String(technology.category || "").trim(),
    description: String(technology.description || "").trim(),
    visible: technology.visible !== false,
    order: Number.isFinite(Number(technology.order)) ? Number(technology.order) : index,
  };
}

function normalizeProject(project: Partial<EditableProject>): EditableProject {
  const title = String(project.title || "").trim();

  return {
    id: String(project.id || slugify(title) || cryptoSafeId("project")),
    title,
    description: String(project.description || ""),
    category: String(project.category || ""),
    technologies: cleanList(project.technologies),
    imageUrl: isRenderableImageUrl(project.imageUrl) ? String(project.imageUrl).trim() : "",
    github: String(project.github || ""),
    githubFullName: String(project.githubFullName || githubFullNameFromUrl(project.github) || ""),
    website: String(project.website || ""),
    featured: Boolean(project.featured),
    published: project.published !== false,
    source: project.source === "github" ? "github" : "manual",
    order: Number.isFinite(Number(project.order)) ? Number(project.order) : 0,
    stars: Number.isFinite(Number(project.stars)) ? Number(project.stars) : 0,
    language: String(project.language || ""),
    updatedAt: String(project.updatedAt || ""),
  };
}

function cryptoSafeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function normalizeSiteContent(value: Partial<SiteContent> = {}): SiteContent {
  const site = { ...defaultSiteContent.site, ...value.site };
  const rawHome = { ...defaultSiteContent.home, ...value.home };
  const about = { ...defaultSiteContent.about, ...value.about };
  const projects = { ...defaultSiteContent.projects, ...value.projects };
  const articles = { ...defaultSiteContent.articles, ...value.articles };
  const technologies = { ...defaultSiteContent.technologies, ...value.technologies };
  const usedArticleSlugs = new Set<string>();

  const heroTitle =
    String(rawHome.heroTitle || "").trim() ||
    [rawHome.titleLine1, rawHome.titleLine2].map((part) => String(part || "").trim()).filter(Boolean).join(" ") ||
    defaultSiteContent.home.heroTitle;
  const heroDescription =
    String(rawHome.heroDescription || rawHome.description || "").trim() ||
    defaultSiteContent.home.heroDescription;

  return {
    ...defaultSiteContent,
    ...value,
    site: {
      ...site,
      footerText:
        String(site.footerText || "").trim() === "Created by ycagdass"
          ? "© 2026 Yusuf Çağdaş. Tüm hakları saklıdır."
          : String(site.footerText || defaultSiteContent.site.footerText),
    },
    home: {
      ...rawHome,
      heroTitle,
      heroDescription,
      description: String(rawHome.description || heroDescription),
      enableTypewriter: rawHome.enableTypewriter === true,
      typewriterWords: cleanList(rawHome.typewriterWords),
    },
    about: {
      ...about,
      skills: cleanList(about.skills),
    },
    technologies: {
      ...technologies,
      items: Array.isArray(technologies.items)
        ? technologies.items
            .map((technology, index) => normalizeTechnology(technology, index))
            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        : defaultSiteContent.technologies.items.map((technology, index) => normalizeTechnology(technology, index)),
    },
    projects: {
      ...projects,
      githubEnabled: projects.githubEnabled !== false,
      githubUsername: String(projects.githubUsername || githubUsernameFromUrl(site.githubUrl) || "ycagdass"),
      includeForks: projects.includeForks === true,
      items: Array.isArray(projects.items)
        ? projects.items.map(normalizeProject)
        : defaultSiteContent.projects.items.map(normalizeProject),
    },
    articles: {
      ...articles,
      items: Array.isArray(articles.items)
        ? articles.items.map((article, index) => normalizeArticle(article, index, usedArticleSlugs))
        : [],
    },
    sections: { ...defaultSiteContent.sections, ...value.sections },
  };
}

export function githubUsernameFromUrl(value?: string) {
  const url = String(value || "").trim();
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return "";
    return parsed.pathname.split("/").filter(Boolean)[0] || "";
  } catch {
    return "";
  }
}

export function githubFullNameFromUrl(value?: string) {
  const url = String(value || "").trim();
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (!parsed.hostname.includes("github.com")) return "";
    const [owner, repo] = parsed.pathname.split("/").filter(Boolean);
    return owner && repo ? `${owner}/${repo}` : "";
  } catch {
    return "";
  }
}
