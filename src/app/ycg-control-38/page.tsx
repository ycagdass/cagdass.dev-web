"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Image from "next/image";
import { Loader2, Lock, LogOut, Save, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { defaultSiteContent, SiteContent } from "@/lib/siteContentShared";

export default function CmsPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [projectsJson, setProjectsJson] = useState("[]");

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
    setProjectsJson(JSON.stringify(data.projects.items, null, 2));
  }

  async function handleLogin(username: string, password: string) {
    setMessage("");
    const response = await fetch("/api/cms/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
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
      const parsedProjects = JSON.parse(projectsJson);
      if (!Array.isArray(parsedProjects)) {
        throw new Error("Projeler JSON listesi bir array olmalı.");
      }

      const payload: SiteContent = {
        ...content,
        projects: {
          ...content.projects,
          items: parsedProjects,
        },
      };

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
      return;
    }

    update("site", target, data.url);
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
      <div className="mx-auto max-w-5xl space-y-5">
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

        <Card>
          <CardHeader>
            <CardTitle>Site Bilgileri ve Görseller</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <TextInput label="Ad Soyad" value={content.site.name} onChange={(value) => update("site", "name", value)} />
            <TextInput label="Marka" value={content.site.brand} onChange={(value) => update("site", "brand", value)} />
            <TextInput label="Domain" value={content.site.domain} onChange={(value) => update("site", "domain", value)} />
            <TextInput label="E-posta" value={content.site.email} onChange={(value) => update("site", "email", value)} />
            <TextInput label="GitHub URL" value={content.site.githubUrl} onChange={(value) => update("site", "githubUrl", value)} />
            <TextInput label="Telegram URL" value={content.site.telegramUrl} onChange={(value) => update("site", "telegramUrl", value)} />
            <TextInput label="Instagram URL" value={content.site.instagramUrl} onChange={(value) => update("site", "instagramUrl", value)} />

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

        <Card>
          <CardHeader>
            <CardTitle>Ana Sayfa</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <TextInput label="Başlık 1" value={content.home.titleLine1} onChange={(value) => update("home", "titleLine1", value)} />
            <TextInput label="Başlık 2" value={content.home.titleLine2} onChange={(value) => update("home", "titleLine2", value)} />
            <TextInput label="Birincil Buton" value={content.home.primaryButtonLabel} onChange={(value) => update("home", "primaryButtonLabel", value)} />
            <TextInput label="İkincil Buton" value={content.home.secondaryButtonLabel} onChange={(value) => update("home", "secondaryButtonLabel", value)} />
            <TextInput label="Yazılar Butonu" value={content.home.articlesButtonLabel} onChange={(value) => update("home", "articlesButtonLabel", value)} />
            <div className="md:col-span-2">
              <TextAreaInput label="Açıklama" value={content.home.description} onChange={(value) => update("home", "description", value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hakkımda</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <TextInput label="İsim" value={content.about.name} onChange={(value) => update("about", "name", value)} />
            <TextInput label="Alt Başlık" value={content.about.subtitle} onChange={(value) => update("about", "subtitle", value)} />
            <div className="md:col-span-2">
              <TextAreaInput label="Metin" value={content.about.body} onChange={(value) => update("about", "body", value)} rows={7} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Projeler ve Bölümler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Projeler Başlığı" value={content.projects.title} onChange={(value) => update("projects", "title", value)} />
              <TextInput label="Projeler Açıklaması" value={content.projects.description} onChange={(value) => update("projects", "description", value)} />
            </div>

            <div className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-3">
              <ToggleRow label="Hakkımda" checked={content.sections.aboutEnabled} onChange={(value) => update("sections", "aboutEnabled", value)} />
              <ToggleRow label="Projeler" checked={content.sections.projectsEnabled} onChange={(value) => update("sections", "projectsEnabled", value)} />
              <ToggleRow label="Yazılar" checked={content.sections.articlesEnabled} onChange={(value) => update("sections", "articlesEnabled", value)} />
            </div>

            <div className="space-y-2">
              <Label>Projeler JSON</Label>
              <Textarea
                value={projectsJson}
                onChange={(event) => setProjectsJson(event.target.value)}
                rows={16}
                className="font-mono text-xs"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function LoginPanel({
  message,
  onLogin,
}: {
  message: string;
  onLogin: (username: string, password: string) => Promise<void>;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    await onLogin(username, password);
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
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
  function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) onUpload(file);
  }

  return (
    <div className="space-y-3">
      <TextInput label={`${label} URL`} value={value} onChange={onChange} />
      <div className="flex items-center gap-3">
        {value && (
          <div className="relative h-12 w-12 overflow-hidden rounded-md border border-border">
            <Image src={value} alt={label} fill className="object-cover" unoptimized />
          </div>
        )}
        <Label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
          <Upload className="h-4 w-4" />
          Yükle
          <Input type="file" accept="image/*" className="hidden" onChange={upload} />
        </Label>
      </div>
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
