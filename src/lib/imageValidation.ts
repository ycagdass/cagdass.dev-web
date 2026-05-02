const allowedMimeTypes = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
]);

function detectImageMime(bytes: Buffer) {
  if (
    bytes.length > 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }

  if (bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }

  if (
    bytes.length > 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }

  if (bytes.length > 12 && bytes.toString("ascii", 4, 12) === "ftypavif") {
    return "image/avif";
  }

  if (
    bytes.length > 6 &&
    (bytes.toString("ascii", 0, 6) === "GIF87a" || bytes.toString("ascii", 0, 6) === "GIF89a")
  ) {
    return "image/gif";
  }

  return null;
}

export async function validateImageUpload(file: File, bytes: Buffer) {
  if (file.size > 5 * 1024 * 1024) {
    return "Görsel 5 MB altında olmalı.";
  }

  if (!allowedMimeTypes.has(file.type)) {
    return "PNG, JPG, JPEG, WEBP, AVIF, GIF veya SVG görsel yüklenebilir.";
  }

  if (file.type === "image/svg+xml") {
    const text = bytes.toString("utf8", 0, Math.min(bytes.length, 512)).toLowerCase();
    if (!text.includes("<svg")) {
      return "SVG dosyası geçerli görünmüyor.";
    }
    return null;
  }

  const detected = detectImageMime(bytes);
  if (detected !== file.type) {
    return "Dosya içeriği seçilen görsel türüyle eşleşmiyor.";
  }

  return null;
}
