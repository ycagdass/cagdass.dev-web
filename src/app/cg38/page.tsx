"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Loader2, Lock, LogOut, Pencil, Plus, Save, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  defaultSiteContent,
  EditableArticle,
  EditableProject,
  EditableTechnology,
  normalizeSiteContent,
  SiteContent,
  slugify,
} from "@/lib/siteContentShared";

const emptyProject = (): EditableProject => ({
  id: crypto.randomUUID(),
  title: "",
  description: "",
  category: "",
  technologies: [],
  imageUrl: "",
  github: "",
  website: "",
  featured: false,
  published: true,
});

const emptyArticle = (): EditableArticle => ({
  id: crypto.randomUUID(),
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  imageUrl: "",
  imageUrls: [],
  category: "",
  tags: [],
  date: new Date().toISOString().slice(0, 10),
  readingTime: "1 dk",
  language: "tr",
  featured: false,
  published: true,
  order: 0,
});

const emptyTechnology = (): EditableTechnology => ({
  id: crypto.randomUUID(),
  name: "",
  iconKey: "",
  iconUrl: "",
  category: "",
  description: "",
  visible: true,
  order: 0,
});

export default function CmsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [editingTechnologyId, setEditingTechnologyId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cms/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        setAuthenticated(Boolean(data.authenticated));
        if (data.authenticated) void loadContent();
      })
      .finally(() => setChecking(false));
  }, []);

  async function loadContent() {
    const response = await fetch("/api/cms/content", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as SiteContent;
    setContent(data);
  }

  async function handleLogin(username: string, password: string, totpCode: string) {
    setMessage("");
    const response = await fetch("/api/cms/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, totpCode }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setMessage(data?.message || "Giriş başarısız.");
      return;
    }

    setAuthenticated(true);
    await loadContent();
  }

  async function handleLogout() {
    await fetch("/api/cms/logout", { method: "POST" });
    setAuthenticated(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");

    try {
      const payload: SiteContent = normalizeSiteContent({
        ...content,
        home: {
          ...content.home,
          typewriterWords: cleanList(content.home.typewriterWords),
        },
        about: {
          ...content.about,
          skills: cleanList(content.about.skills),
        },
        technologies: {
          ...content.technologies,
          items: content.technologies.items.map(normalizeTechnology),
        },
        projects: {
          ...content.projects,
          items: content.projects.items.map(normalizeProject),
        },
        articles: {
          ...content.articles,
          items: content.articles.items.map((article, index) => normalizeArticle(article, index)),
        },
      });

      const response = await fetch("/api/cms/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || "Kaydedilemedi.");
      }

      setContent(payload);
      setMessage("Değişiklikler kaydedildi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Geçersiz veri.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file: File, target: "logoUrl" | "profileImageUrl") {
    const url = await uploadImage(file);
    if (url) {
      update("site", target, url);
      setMessage(`Yüklenen görsel ${target === "logoUrl" ? "Logo" : "Profil Görseli"} alanına yazıldı: ${url}`);
    }
  }

  async function handleProjectUpload(file: File, projectId: string) {
    const url = await uploadImage(file);
    if (url) {
      updateProject(projectId, "imageUrl", url);
      setMessage(`Yüklenen görsel Proje Görseli alanına yazıldı: ${url}`);
    }
  }

  async function handleArticleUpload(file: File, articleId: string) {
    const url = await uploadImage(file);
    if (url) {
      updateArticle(articleId, "imageUrl", url);
      setMessage(`Yüklenen görsel Kapak Görseli alanına yazıldı: ${url}`);
    }
  }

  async function handleArticleGalleryUpload(files: FileList, articleId: string) {
    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const url = await uploadImage(file);
      if (url) uploadedUrls.push(url);
    }

    if (uploadedUrls.length === 0) return;

    const article = content.articles.items.find((item) => item.id === articleId);
    const nextUrls = uniqueList([...(article?.imageUrls || []), ...uploadedUrls]);
    updateArticle(articleId, "imageUrls", nextUrls);
    setMessage(`${uploadedUrls.length} yazı içi görsel eklendi.`);
  }

  async function uploadImage(file: File) {
    setMessage("");
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/cms/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      setMessage(data?.message || "Görsel yüklenemedi.");
      return "";
    }

    return typeof data?.url === "string" ? data.url : "";
  }

  function update<K extends keyof SiteContent, F extends keyof SiteContent[K]>(
    group: K,
    field: F,
    value: SiteContent[K][F]
  ) {
    setContent((current) => ({
      ...current,
      [group]: {
        ...current[group],
        [field]: value,
      },
    }));
  }

  function updateProjects(items: EditableProject[]) {
    update("projects", "items", items);
  }

  function updateArticles(items: EditableArticle[]) {
    update("articles", "items", items);
  }

  function updateTechnologies(items: EditableTechnology[]) {
    update("technologies", "items", items);
  }

  function addProject() {
    const project = emptyProject();
    updateProjects([...content.projects.items, project]);
    setEditingProjectId(project.id);
  }

  function addArticle() {
    const article = emptyArticle();
    updateArticles([...content.articles.items, article]);
    setEditingArticleId(article.id);
  }

  function addTechnology() {
    if (!window.confirm("Bu teknoloji eklensin mi?")) return;
    const technology = { ...emptyTechnology(), order: content.technologies.items.length };
    updateTechnologies([...content.technologies.items, technology]);
    setEditingTechnologyId(technology.id);
  }

  function updateProject<K extends keyof EditableProject>(
    id: string,
    field: K,
    value: EditableProject[K]
  ) {
    updateProjects(
      content.projects.items.map((project) =>
        project.id === id ? normalizeProject({ ...project, [field]: value }) : project
      )
    );
  }

  function updateArticle<K extends keyof EditableArticle>(
    id: string,
    field: K,
    value: EditableArticle[K]
  ) {
    updateArticles(
      content.articles.items.map((article) =>
        article.id === id ? normalizeArticle({ ...article, [field]: value }, 0) : article
      )
    );
  }

  function updateTechnology<K extends keyof EditableTechnology>(
    id: string,
    field: K,
    value: EditableTechnology[K]
  ) {
    updateTechnologies(
      content.technologies.items.map((technology) =>
        technology.id === id ? normalizeTechnology({ ...technology, [field]: value }) : technology
      )
    );
  }

  function removeProject(id: string) {
    if (!window.confirm("Bu projeyi silmek istiyor musun?")) return;
    updateProjects(content.projects.items.filter((project) => project.id !== id));
  }

  function removeArticle(id: string) {
    if (!window.confirm("Bu yazıyı silmek istiyor musun?")) return;
    updateArticles(content.articles.items.filter((article) => article.id !== id));
  }

  function removeTechnology(id: string) {
    if (!window.confirm("Bu teknoloji silinsin mi?")) return;
    updateTechnologies(content.technologies.items.filter((technology) => technology.id !== id));
  }

  function moveProject(id: string, direction: -1 | 1) {
    updateProjects(moveById(content.projects.items, id, direction));
  }

  function moveArticle(id: string, direction: -1 | 1) {
    updateArticles(moveById(content.articles.items, id, direction));
  }

  function moveTechnology(id: string, direction: -1 | 1) {
    updateTechnologies(moveById(content.technologies.items, id, direction));
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPanel message={message} onLogin={handleLogin} />;
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">cagdass.dev</p>
            <h1 className="text-3xl font-bold tracking-tight">İçerik Yönetimi</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Çıkış
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Kaydet
            </Button>
          </div>
        </div>

        {message && (
          <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
            {message}
          </div>
        )}

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-lg p-1">
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="home">Ana Sayfa</TabsTrigger>
            <TabsTrigger value="about">Hakkımda</TabsTrigger>
            <TabsTrigger value="technologies">Teknolojiler</TabsTrigger>
            <TabsTrigger value="projects">Projeler</TabsTrigger>
            <TabsTrigger value="articles">Yazılar</TabsTrigger>
            <TabsTrigger value="media">Medya</TabsTrigger>
            <TabsTrigger value="settings">Ayarlar</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Site Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <TextInput label="Ad Soyad" value={content.site.name} onChange={(value) => update("site", "name", value)} />
                <TextInput label="Marka" value={content.site.brand} onChange={(value) => update("site", "brand", value)} />
                <TextInput label="Domain" value={content.site.domain} onChange={(value) => update("site", "domain", value)} />
                <TextInput label="E-posta" value={content.site.email} onChange={(value) => update("site", "email", value)} />
                <TextInput label="GitHub URL" value={content.site.githubUrl} onChange={(value) => update("site", "githubUrl", value)} />
                <TextInput label="Telegram URL" value={content.site.telegramUrl} onChange={(value) => update("site", "telegramUrl", value)} />
                <TextInput label="Instagram URL" value={content.site.instagramUrl} onChange={(value) => update("site", "instagramUrl", value)} />
                <TextInput label="Footer Metni" value={content.site.footerText} onChange={(value) => update("site", "footerText", value)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="home">
            <Card>
              <CardHeader>
                <CardTitle>Ana Sayfa</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <TextInput label="Ana Sayfa Başlığı" value={content.home.heroTitle} onChange={(value) => update("home", "heroTitle", value)} />
                </div>
                <div className="md:col-span-2">
                  <TextAreaInput label="Hero Açıklaması" value={content.home.heroDescription} onChange={(value) => update("home", "heroDescription", value)} />
                </div>
                <TextInput label="Birincil Buton" value={content.home.primaryButtonLabel} onChange={(value) => update("home", "primaryButtonLabel", value)} />
                <TextInput label="Birincil Link" value={content.home.primaryButtonHref} onChange={(value) => update("home", "primaryButtonHref", value)} />
                <TextInput label="İkincil Buton" value={content.home.secondaryButtonLabel} onChange={(value) => update("home", "secondaryButtonLabel", value)} />
                <TextInput label="İkincil Link" value={content.home.secondaryButtonHref} onChange={(value) => update("home", "secondaryButtonHref", value)} />
                <TextInput label="Yazılar Butonu" value={content.home.articlesButtonLabel} onChange={(value) => update("home", "articlesButtonLabel", value)} />
                <TextInput label="Yazılar Linki" value={content.home.articlesButtonHref} onChange={(value) => update("home", "articlesButtonHref", value)} />
                <div className="md:col-span-2 rounded-lg border border-border p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold">Gelişmiş</h3>
                      <p className="text-xs text-muted-foreground">Typewriter kapalıyken public ana sayfada sadece ana sayfa başlığı gösterilir.</p>
                    </div>
                    <ToggleRow label="Typewriter açık" checked={content.home.enableTypewriter} onChange={(value) => update("home", "enableTypewriter", value)} />
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <TextInput label="Typewriter Başlık 1" value={content.home.titleLine1} onChange={(value) => update("home", "titleLine1", value)} />
                    <TextInput label="Typewriter Varsayılan Kelime" value={content.home.titleLine2} onChange={(value) => update("home", "titleLine2", value)} />
                    <div className="md:col-span-2">
                      <TextInput label="Typewriter Kelimeleri" value={content.home.typewriterWords.join(", ")} onChange={(value) => update("home", "typewriterWords", splitList(value))} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Hakkımda</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <TextInput label="Sayfa Başlığı" value={content.about.title} onChange={(value) => update("about", "title", value)} />
                <TextInput label="İsim" value={content.about.name} onChange={(value) => update("about", "name", value)} />
                <TextInput label="Alt Başlık" value={content.about.subtitle} onChange={(value) => update("about", "subtitle", value)} />
                <TextInput label="Profil Kartı Başlığı" value={content.about.profileTitle} onChange={(value) => update("about", "profileTitle", value)} />
                <TextInput label="Profil Kartı Alt Başlığı" value={content.about.profileSubtitle} onChange={(value) => update("about", "profileSubtitle", value)} />
                <TextInput label="Yetenekler" value={content.about.skills.join(", ")} onChange={(value) => update("about", "skills", splitList(value))} />
                <div className="md:col-span-2">
                  <TextAreaInput label="Hakkımda Metni" value={content.about.body} onChange={(value) => update("about", "body", value)} rows={7} />
                </div>
                <TextAreaInput label="Deneyim" value={content.about.experience} onChange={(value) => update("about", "experience", value)} />
                <TextAreaInput label="Eğitim" value={content.about.education} onChange={(value) => update("about", "education", value)} />
                <TextAreaInput label="Sertifikalar" value={content.about.certifications} onChange={(value) => update("about", "certifications", value)} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technologies">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Teknolojiler</CardTitle>
                  <Button type="button" variant="outline" onClick={addTechnology}>
                    <Plus className="h-4 w-4" />
                    Teknoloji Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <TextInput label="Bölüm Başlığı" value={content.technologies.title} onChange={(value) => update("technologies", "title", value)} />
                {content.technologies.items.length === 0 && <EmptyState text="Henüz teknoloji yok." />}
                {content.technologies.items.map((technology, index) => (
                  <TechnologyEditor
                    key={technology.id}
                    technology={normalizeTechnology(technology)}
                    index={index}
                    total={content.technologies.items.length}
                    editing={editingTechnologyId === technology.id}
                    onEdit={() => setEditingTechnologyId(editingTechnologyId === technology.id ? null : technology.id)}
                    onChange={updateTechnology}
                    onMove={moveTechnology}
                    onRemove={removeTechnology}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Projeler</CardTitle>
                  <Button type="button" variant="outline" onClick={addProject}>
                    <Plus className="h-4 w-4" />
                    Proje Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput label="Projeler Başlığı" value={content.projects.title} onChange={(value) => update("projects", "title", value)} />
                  <TextInput label="Projeler Açıklaması" value={content.projects.description} onChange={(value) => update("projects", "description", value)} />
                </div>
                <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-2">
                  <ToggleRow label="GitHub'dan otomatik çek" checked={content.projects.githubEnabled !== false} onChange={(value) => update("projects", "githubEnabled", value)} />
                  <ToggleRow label="Fork projeleri dahil et" checked={content.projects.includeForks === true} onChange={(value) => update("projects", "includeForks", value)} />
                  <TextInput
                    label="GitHub kullanıcı adı"
                    value={content.projects.githubUsername}
                    onChange={(value) => update("projects", "githubUsername", value)}
                    helperText="Public GitHub repoları otomatik proje kartı olarak gelir. Aynı repoyu admin panelde düzenlersen ayarların korunur."
                  />
                </div>
                {content.projects.items.length === 0 && <EmptyState text="Henüz proje yok." />}
                {content.projects.items.map((project, index) => (
                  <ProjectEditor
                    key={project.id}
                    project={normalizeProject(project)}
                    index={index}
                    total={content.projects.items.length}
                    editing={editingProjectId === project.id}
                    onEdit={() => setEditingProjectId(editingProjectId === project.id ? null : project.id)}
                    onChange={updateProject}
                    onMove={moveProject}
                    onRemove={removeProject}
                    onUpload={handleProjectUpload}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle>Yazılar</CardTitle>
                  <Button type="button" variant="outline" onClick={addArticle}>
                    <Plus className="h-4 w-4" />
                    Yazı Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <TextInput label="Yazılar Başlığı" value={content.articles.title} onChange={(value) => update("articles", "title", value)} />
                  <TextInput label="Yazılar Açıklaması" value={content.articles.description} onChange={(value) => update("articles", "description", value)} />
                </div>
                {content.articles.items.length === 0 && <EmptyState text="Henüz yazı yok." />}
                {content.articles.items.map((article, index) => (
                  <ArticleEditor
                    key={article.id}
                    article={normalizeArticle(article, index)}
                    index={index}
                    total={content.articles.items.length}
                    editing={editingArticleId === article.id}
                    onEdit={() => setEditingArticleId(editingArticleId === article.id ? null : article.id)}
                    onChange={updateArticle}
                    onMove={moveArticle}
                    onRemove={removeArticle}
                    onUpload={handleArticleUpload}
                    onGalleryUpload={handleArticleGalleryUpload}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Medya</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <ImageUpload
                  label="Logo"
                  value={content.site.logoUrl}
                  onChange={(value) => update("site", "logoUrl", value)}
                  onUpload={(file) => handleUpload(file, "logoUrl")}
                />
                <ImageUpload
                  label="Profil Görseli"
                  value={content.site.profileImageUrl}
                  onChange={(value) => update("site", "profileImageUrl", value)}
                  onUpload={(file) => handleUpload(file, "profileImageUrl")}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Ayarlar</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
                <ToggleRow label="Hakkımda" checked={content.sections.aboutEnabled} onChange={(value) => update("sections", "aboutEnabled", value)} />
                <ToggleRow label="Teknolojiler" checked={content.sections.technologiesEnabled} onChange={(value) => update("sections", "technologiesEnabled", value)} />
                <ToggleRow label="Projeler" checked={content.sections.projectsEnabled} onChange={(value) => update("sections", "projectsEnabled", value)} />
                <ToggleRow label="Yazılar" checked={content.sections.articlesEnabled} onChange={(value) => update("sections", "articlesEnabled", value)} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end border-t border-border pt-5">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </Button>
        </div>
      </div>
    </main>
  );
}

function normalizeProject(project: EditableProject): EditableProject {
  return {
    ...project,
    id: project.id || crypto.randomUUID(),
    imageUrl: project.imageUrl || "",
    github: project.github || "",
    githubFullName: project.githubFullName || "",
    website: project.website || "",
    technologies: Array.isArray(project.technologies) ? cleanList(project.technologies) : [],
    featured: Boolean(project.featured),
    published: project.published !== false,
    source: project.source === "github" ? "github" : "manual",
    order: Number.isFinite(Number(project.order)) ? Number(project.order) : 0,
    stars: Number.isFinite(Number(project.stars)) ? Number(project.stars) : 0,
    language: project.language || "",
    updatedAt: project.updatedAt || "",
  };
}

function normalizeArticle(article: EditableArticle, index: number): EditableArticle {
  const title = article.title || "";
  return {
    ...article,
    id: article.id || crypto.randomUUID(),
    title,
    slug: article.slug || slugify(title),
    excerpt: article.excerpt || "",
    content: article.content || "",
    imageUrl: article.imageUrl || "",
    imageUrls: Array.isArray(article.imageUrls) ? cleanList(article.imageUrls) : [],
    category: article.category || "",
    tags: Array.isArray(article.tags) ? cleanList(article.tags) : [],
    date: article.date || new Date().toISOString().slice(0, 10),
    readingTime: article.readingTime || "1 dk",
    language: article.language === "en" ? "en" : "tr",
    featured: Boolean(article.featured),
    published: article.published !== false,
    order: Number.isFinite(Number(article.order)) ? Number(article.order) : index,
  };
}

function normalizeTechnology(technology: EditableTechnology): EditableTechnology {
  return {
    ...technology,
    id: technology.id || crypto.randomUUID(),
    name: technology.name || "",
    iconKey: technology.iconKey || "",
    iconUrl: technology.iconUrl || "",
    category: technology.category || "",
    description: technology.description || "",
    visible: technology.visible !== false,
    order: Number.isFinite(Number(technology.order)) ? Number(technology.order) : 0,
  };
}

function moveById<T extends { id: string }>(items: T[], id: string, direction: -1 | 1) {
  const currentIndex = items.findIndex((item) => item.id === id);
  const nextIndex = currentIndex + direction;
  if (currentIndex < 0 || nextIndex < 0 || nextIndex >= items.length) return items;

  const nextItems = [...items];
  const [item] = nextItems.splice(currentIndex, 1);
  nextItems.splice(nextIndex, 0, item);
  return nextItems;
}

function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanList(value: string[]) {
  return value.map((item) => item.trim()).filter(Boolean);
}

function uniqueList(value: string[]) {
  return Array.from(new Set(cleanList(value)));
}

function ProjectEditor({
  project,
  index,
  total,
  editing,
  onEdit,
  onChange,
  onMove,
  onRemove,
  onUpload,
}: {
  project: EditableProject;
  index: number;
  total: number;
  editing: boolean;
  onEdit: () => void;
  onChange: <K extends keyof EditableProject>(
    id: string,
    field: K,
    value: EditableProject[K]
  ) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onUpload: (file: File, projectId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <EditorHeader
        title={project.title || "Yeni proje"}
        eyebrow={`Proje ${index + 1}`}
        index={index}
        total={total}
        editing={editing}
        onEdit={onEdit}
        onMove={(direction) => onMove(project.id, direction)}
        onRemove={() => onRemove(project.id)}
      />

      {!editing ? (
        <CompactSummary items={[project.category, project.source === "github" ? "GitHub" : "Manuel", project.published === false ? "Taslak" : "Yayında", project.featured ? "Öne çıkan" : ""]} />
      ) : (
      <>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Başlık" value={project.title} onChange={(value) => onChange(project.id, "title", value)} />
        <TextInput label="Kategori" value={project.category} onChange={(value) => onChange(project.id, "category", value)} />
        <div className="md:col-span-2">
          <TextAreaInput label="Açıklama" value={project.description} onChange={(value) => onChange(project.id, "description", value)} rows={3} />
        </div>
        <TextInput label="Teknolojiler" value={project.technologies.join(", ")} onChange={(value) => onChange(project.id, "technologies", splitList(value))} />
        <TextInput label="GitHub URL" value={project.github || ""} onChange={(value) => onChange(project.id, "github", value)} />
        <TextInput label="GitHub repo adı" value={project.githubFullName || ""} onChange={(value) => onChange(project.id, "githubFullName", value)} helperText="Örn: ycagdass/proje-adi. GitHub'dan gelen repo ile admin ayarlarını eşleştirir." />
        <TextInput label="Site URL" value={project.website || ""} onChange={(value) => onChange(project.id, "website", value)} />
        <TextInput label="Sıra" value={String(project.order ?? index)} onChange={(value) => onChange(project.id, "order", Number(value) || 0)} />
        <ImageUpload
          label="Proje Görseli"
          value={project.imageUrl || ""}
          onChange={(value) => onChange(project.id, "imageUrl", value)}
          onUpload={(file) => onUpload(file, project.id)}
        />
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
        <ToggleRow label="Yayında" checked={project.published !== false} onChange={(value) => onChange(project.id, "published", value)} />
        <ToggleRow label="Öne çıkan" checked={project.featured} onChange={(value) => onChange(project.id, "featured", value)} />
      </div>
      </>
      )}
    </div>
  );
}

function ArticleEditor({
  article,
  index,
  total,
  editing,
  onEdit,
  onChange,
  onMove,
  onRemove,
  onUpload,
  onGalleryUpload,
}: {
  article: EditableArticle;
  index: number;
  total: number;
  editing: boolean;
  onEdit: () => void;
  onChange: <K extends keyof EditableArticle>(
    id: string,
    field: K,
    value: EditableArticle[K]
  ) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
  onUpload: (file: File, articleId: string) => void;
  onGalleryUpload: (files: FileList, articleId: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <EditorHeader
        title={article.title || "Yeni yazı"}
        eyebrow={`Yazı ${index + 1}`}
        index={index}
        total={total}
        editing={editing}
        onEdit={onEdit}
        onMove={(direction) => onMove(article.id, direction)}
        onRemove={() => onRemove(article.id)}
      />

      {!editing ? (
        <CompactSummary items={[article.category, article.published === false ? "Taslak" : "Yayında", article.slug ? `/articles/${article.slug}` : "Slug otomatik oluşacak"]} />
      ) : (
      <>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Başlık" value={article.title} onChange={(value) => onChange(article.id, "title", value)} />
        <TextInput label="Slug" value={article.slug} onChange={(value) => onChange(article.id, "slug", slugify(value))} />
        <TextInput label="Kategori" value={article.category} onChange={(value) => onChange(article.id, "category", value)} />
        <TextInput label="Etiketler" value={article.tags.join(", ")} onChange={(value) => onChange(article.id, "tags", splitList(value))} />
        <TextInput label="Tarih" type="date" value={article.date} onChange={(value) => onChange(article.id, "date", value)} />
        <TextInput label="Okuma Süresi" value={article.readingTime} onChange={(value) => onChange(article.id, "readingTime", value)} />
        <TextInput label="Dil" value={article.language} onChange={(value) => onChange(article.id, "language", value === "en" ? "en" : "tr")} />
        <TextInput label="Sıra" value={String(article.order ?? index)} onChange={(value) => onChange(article.id, "order", Number(value) || 0)} />
        <div className="md:col-span-2">
          <TextAreaInput label="Kısa Açıklama" value={article.excerpt} onChange={(value) => onChange(article.id, "excerpt", value)} rows={3} />
        </div>
        <div className="md:col-span-2">
          <TextAreaInput label="İçerik" value={article.content} onChange={(value) => onChange(article.id, "content", value)} rows={8} />
        </div>
        <ImageUpload
          label="Kapak Görseli"
          value={article.imageUrl || ""}
          onChange={(value) => onChange(article.id, "imageUrl", value)}
          onUpload={(file) => onUpload(file, article.id)}
        />
        <div className="md:col-span-2">
          <GalleryImageUpload
            label="Yazı İçi Görseller"
            values={article.imageUrls || []}
            onChange={(values) => onChange(article.id, "imageUrls", values)}
            onUpload={(files) => onGalleryUpload(files, article.id)}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
        <ToggleRow label="Yayında" checked={article.published !== false} onChange={(value) => onChange(article.id, "published", value)} />
        <ToggleRow label="Öne çıkan" checked={article.featured} onChange={(value) => onChange(article.id, "featured", value)} />
      </div>
      </>
      )}
    </div>
  );
}

function TechnologyEditor({
  technology,
  index,
  total,
  editing,
  onEdit,
  onChange,
  onMove,
  onRemove,
}: {
  technology: EditableTechnology;
  index: number;
  total: number;
  editing: boolean;
  onEdit: () => void;
  onChange: <K extends keyof EditableTechnology>(
    id: string,
    field: K,
    value: EditableTechnology[K]
  ) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <EditorHeader
        title={technology.name || "Yeni teknoloji"}
        eyebrow={`Teknoloji ${index + 1}`}
        index={index}
        total={total}
        editing={editing}
        onEdit={onEdit}
        onMove={(direction) => onMove(technology.id, direction)}
        onRemove={() => onRemove(technology.id)}
      />

      {!editing ? (
        <CompactSummary items={[technology.category, technology.visible === false ? "Gizli" : "Görünür", technology.description || ""]} />
      ) : (
      <>
      <p className="mb-4 text-sm text-muted-foreground">
        İkon için kısa bir icon key yazabilirsin. Emin değilsen boş bırak; teknoloji adı yine görünür.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <TextInput label="Ad" value={technology.name} onChange={(value) => onChange(technology.id, "name", value)} />
        <TextInput label="Icon key" value={technology.iconKey} onChange={(value) => onChange(technology.id, "iconKey", value)} helperText="Örn: react, python, docker. Emin değilsen boş bırak." />
        <TextInput label="Icon URL" value={technology.iconUrl || ""} onChange={(value) => onChange(technology.id, "iconUrl", value)} helperText="Upload veya harici görsel URL'si. /uploads/dosya.ext formatı önerilir." />
        <TextInput label="Kategori" value={technology.category} onChange={(value) => onChange(technology.id, "category", value)} />
        <TextInput label="Açıklama / Seviye" value={technology.description || ""} onChange={(value) => onChange(technology.id, "description", value)} />
      </div>

      <div className="mt-4 rounded-lg border border-border p-4">
        <ToggleRow label="Görünür" checked={technology.visible !== false} onChange={(value) => onChange(technology.id, "visible", value)} />
      </div>
      </>
      )}
    </div>
  );
}

function EditorHeader({
  title,
  eyebrow,
  index,
  total,
  editing,
  onEdit,
  onMove,
  onRemove,
}: {
  title: string;
  eyebrow: string;
  index: number;
  total: number;
  editing: boolean;
  onEdit: () => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{eyebrow}</p>
        <h3 className="text-base font-semibold">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onEdit}>
          {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editing ? "Kapat" : "Düzenle"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Yukarı taşı">
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Aşağı taşı">
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onRemove}>
          <Trash2 className="h-4 w-4" />
          Sil
        </Button>
      </div>
    </div>
  );
}

function CompactSummary({ items }: { items: string[] }) {
  const cleanItems = items.map((item) => item.trim()).filter(Boolean);

  if (cleanItems.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
      {cleanItems.map((item) => (
        <span key={item} className="rounded-md border border-border px-2 py-1">
          {item}
        </span>
      ))}
    </div>
  );
}

function LoginPanel({
  message,
  onLogin,
}: {
  message: string;
  onLogin: (username: string, password: string, totpCode: string) => Promise<void>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    await onLogin(username, password, totpCode);
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Lock className="h-5 w-5" />
          </div>
          <CardTitle>İçerik Yönetimi</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <TextInput label="Kullanıcı adı" value={username} onChange={setUsername} />
            <TextInput label="Şifre" type="password" value={password} onChange={setPassword} />
            <TextInput
              label="Doğrulama kodu"
              value={totpCode}
              onChange={(value) => setTotpCode(value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              pattern="[0-9]*"
            />
            {message && <p className="text-sm text-destructive">{message}</p>}
            <Button className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  inputMode,
  autoComplete,
  maxLength,
  pattern,
  helperText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
  helperText?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        pattern={pattern}
        onChange={(event) => onChange(event.target.value)}
      />
      {helperText && <p className="text-xs leading-5 text-muted-foreground">{helperText}</p>}
    </div>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={rows} />
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
  onUpload,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [value]);

  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
  }

  return (
    <div className="space-y-3">
      <TextInput label={`${label} URL`} value={value} onChange={onChange} helperText="Upload sonrası dönen URL bu alana yazılır. Yerel görseller /uploads/dosya.jpg gibi görünür; JPG, PNG, WEBP, AVIF, GIF ve SVG desteklenir." />
      <div className="flex items-center gap-3">
        {value && !failed && (
          <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border">
            <Image src={value} alt={label} fill className="object-cover" unoptimized onError={() => setFailed(true)} />
          </div>
        )}
        <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
          <Upload className="h-4 w-4" />
          Yükle
          <Input type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg" className="hidden" onChange={upload} />
        </Label>
      </div>
    </div>
  );
}

function GalleryImageUpload({
  label,
  values,
  onChange,
  onUpload,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  onUpload: (files: FileList) => void;
}) {
  function upload(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files?.length) onUpload(files);
    event.target.value = "";
  }

  function updateValue(index: number, value: string) {
    onChange(values.map((item, itemIndex) => (itemIndex === index ? value : item)));
  }

  function removeValue(index: number) {
    onChange(values.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Label>{label}</Label>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Birden fazla JPG, PNG, WEBP, AVIF, GIF veya SVG yükleyebilirsin. Eklenen tüm görseller yazı detayında görünür.
          </p>
        </div>
        <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
          <Upload className="h-4 w-4" />
          Görsel Ekle
          <Input type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.avif,.gif,.svg" multiple className="hidden" onChange={upload} />
        </Label>
      </div>

      {values.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
          Henüz yazı içi görsel yok.
        </p>
      ) : (
        <div className="space-y-3">
          {values.map((value, index) => (
            <div key={`${value}-${index}`} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-[4rem_1fr_auto] md:items-center">
              <AdminImagePreview value={value} label={`${label} ${index + 1}`} />
              <TextInput
                label={`Görsel ${index + 1} URL`}
                value={value}
                onChange={(nextValue) => updateValue(index, nextValue)}
                helperText="Yerel yüklemelerde /uploads/dosya.jpg gibi URL kullanılır."
              />
              <Button type="button" variant="outline" size="sm" onClick={() => removeValue(index)}>
                <Trash2 className="h-4 w-4" />
                Sil
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminImagePreview({ value, label }: { value: string; label: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [value]);

  if (!value || failed) {
    return <div className="hidden h-14 w-14 rounded-md border border-dashed border-border md:block" />;
  }

  return (
    <div className="relative h-14 w-14 overflow-hidden rounded-md border border-border">
      <Image src={value} alt={label} fill className="object-cover" unoptimized onError={() => setFailed(true)} />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <Label>{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
