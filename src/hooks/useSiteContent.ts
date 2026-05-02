"use client";

import { useEffect, useState } from "react";
import { defaultSiteContent, SiteContent } from "@/lib/siteContentShared";

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);

  useEffect(() => {
    let active = true;

    fetch("/api/site-content", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setContent(data);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return content;
}
