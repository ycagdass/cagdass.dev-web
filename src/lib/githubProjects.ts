import {
  EditableProject,
  githubFullNameFromUrl,
  normalizeSiteContent,
  SiteContent,
  slugify,
} from "@/lib/siteContentShared";

type GithubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  topics?: string[];
  pushed_at: string | null;
  updated_at: string | null;
};

export async function enrichSiteContentWithGithubProjects(content: SiteContent): Promise<SiteContent> {
  const normalized = normalizeSiteContent(content);

  if (!normalized.projects.githubEnabled || !normalized.projects.githubUsername) {
    return normalized;
  }

  try {
    const repos = await fetchGithubRepos(normalized.projects.githubUsername);
    const githubProjects = repos
      .filter((repo) => normalized.projects.includeForks || !repo.fork)
      .map((repo, index) => repoToProject(repo, index));
    const items = mergeGithubProjects(normalized.projects.items, githubProjects);

    return normalizeSiteContent({
      ...normalized,
      projects: {
        ...normalized.projects,
        items,
      },
    });
  } catch {
    return normalized;
  }
}

async function fetchGithubRepos(username: string) {
  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "cagdass-dev-site",
      },
      next: { revalidate: 600 },
    }
  );

  if (!response.ok) throw new Error("GitHub projeleri alınamadı.");

  return (await response.json()) as GithubRepo[];
}

function repoToProject(repo: GithubRepo, index: number): EditableProject {
  const technologies = [repo.language, ...(repo.topics || [])]
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  return {
    id: `github-${slugify(repo.full_name)}`,
    title: repo.name,
    description: repo.description || "GitHub üzerinden otomatik eklenen proje.",
    category: repo.language || "GitHub",
    technologies,
    imageUrl: "",
    github: repo.html_url,
    githubFullName: repo.full_name,
    website: repo.homepage || "",
    featured: repo.stargazers_count > 0,
    published: true,
    source: "github",
    order: 1000 + index,
    stars: repo.stargazers_count,
    language: repo.language || "",
    updatedAt: repo.pushed_at || repo.updated_at || "",
  };
}

function mergeGithubProjects(manualProjects: EditableProject[], githubProjects: EditableProject[]) {
  const githubByFullName = new Map(githubProjects.map((project) => [project.githubFullName, project]));
  const matchedGithub = new Set<string>();
  const merged: EditableProject[] = [];

  for (const project of manualProjects) {
    const fullName = project.githubFullName || githubFullNameFromUrl(project.github);
    const githubProject = fullName ? githubByFullName.get(fullName) : undefined;

    if (!githubProject) {
      merged.push(project);
      continue;
    }

    matchedGithub.add(fullName);
    merged.push({
      ...githubProject,
      ...project,
      id: project.id || githubProject.id,
      github: project.github || githubProject.github,
      githubFullName: fullName,
      source: "github",
      stars: githubProject.stars,
      language: githubProject.language,
      updatedAt: githubProject.updatedAt,
      technologies: project.technologies.length > 0 ? project.technologies : githubProject.technologies,
      website: project.website || githubProject.website,
      published: project.published !== false,
    });
  }

  for (const project of githubProjects) {
    if (project.githubFullName && !matchedGithub.has(project.githubFullName)) {
      merged.push(project);
    }
  }

  return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
