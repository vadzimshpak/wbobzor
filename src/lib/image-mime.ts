/** Определение MIME по сигнатуре файла (JPEG / PNG / WebP). */
export function detectImageMimeFromBytes(buf: Uint8Array): string {
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xd8) {
    return "image/jpeg";
  }
  if (
    buf.length >= 8 &&
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46
  ) {
    return "image/webp";
  }
  return "application/octet-stream";
}

export const ALLOWED_ARTICLE_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
