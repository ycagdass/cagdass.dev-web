"use client";

import { useState } from "react";
import Image from "next/image";

export function SafeArticleImage({
  src,
  alt,
  className = "object-cover",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 768px) 768px, 100vw"
      className={className}
      unoptimized
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
