import { promises as fs } from "fs";
import path from "path";
import { defaultSiteContent, normalizeSiteContent, SiteContent } from "@/lib/siteContentShared";

const contentFile = () =>
  path.join(process.cwd(), "data", "site-content.json");

export async function readSiteContent(): Promise<SiteContent> {
  try {
    const raw = await fs.readFile(contentFile(), "utf8");
    return normalizeSiteContent(JSON.parse(raw));
  } catch {
    return normalizeSiteContent(defaultSiteContent);
  }
}

export async function writeSiteContent(content: SiteContent) {
  const file = contentFile();
  const backupDir = path.join(path.dirname(file), "backups");

  await fs.mkdir(path.dirname(file), { recursive: true });

  try {
    const current = await fs.readFile(file, "utf8");
    await fs.mkdir(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    await fs.writeFile(path.join(backupDir, `site-content-${timestamp}.json`), current, "utf8");

    const backups = await fs.readdir(backupDir);
    const contentBackups = backups
      .filter((name) => name.startsWith("site-content-") && name.endsWith(".json"))
      .sort();

    const keepCount = Number(process.env.CONTENT_BACKUP_KEEP || 30);
    for (const oldBackup of contentBackups.slice(0, Math.max(0, contentBackups.length - keepCount))) {
      await fs.unlink(path.join(backupDir, oldBackup));
    }
  } catch {
    // First write or read-only backup failure should not block saving content.
  }

  await fs.writeFile(file, JSON.stringify(normalizeSiteContent(content), null, 2), "utf8");
}
