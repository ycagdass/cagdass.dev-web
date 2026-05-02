import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ISO6391 from "iso-639-1";

export const toStringParam = (
    value?: string | string[]
): string | null => {
  if (!value) return null;
  return decodeURIComponent(
      Array.isArray(value) ? value[0] : value
  );
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function getBannerUrl(bannerId: string): string {
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || "https://cagdass.dev"
  return `${cdnUrl}/mwb/article_banners/${bannerId}.png`
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string, localeCode = "en-US") {
  return new Date(date).toLocaleDateString(localeCode, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateWithTime(date: any, localeCode = "en-US"): string {
  if (!date) return "—"
  const d = new Date(date)
  return d.toLocaleDateString(localeCode, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatISODate(date: Date) {
  return date.toISOString().split("T")[0];
}

export function getLanguageDisplayName(languageCode: string, displayLocale = "en"): string {
  if (!languageCode) return "";

  const code = languageCode.trim().replace(/_/g, "-");
  const splittedLangCode = code.split("-");
  const base = splittedLangCode[0]
  const region = splittedLangCode[1]

  try {
    const dn = new Intl.DisplayNames([displayLocale], { type: "language" });
    var name = ""
    if (base.toLowerCase() == region.toLowerCase() || base == "en") {
      name = dn.of(base)
    } else {
      name = dn.of(code)
    }
    if (name) return capitalizeFirstLetter(name, displayLocale);
  } catch {
    const name = ISO6391.getName(base) || ISO6391.getNativeName(base);
    if (name) return capitalizeFirstLetter(name, displayLocale);
    return code;
  }
}

export const generatePageNumbers = (totalPageSize: number, currentPage: number) => {
  const pages = [];
  const maxVisiblePages = 5;

  if (totalPageSize <= maxVisiblePages) {
    for (let i = 1; i <= totalPageSize; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPageSize);
    } else if (currentPage >= totalPageSize - 2) {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = totalPageSize - 3; i <= totalPageSize; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push("ellipsis");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pages.push(i);
      }
      pages.push("ellipsis");
      pages.push(totalPageSize);
    }
  }

  return pages;
};

function capitalizeFirstLetter(str: string, locale = "en"): string {
  return str
      ? str[0].toLocaleUpperCase(locale) + str.slice(1)
      : "";
}
