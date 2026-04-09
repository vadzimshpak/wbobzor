import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const MAX_COVER_BYTES = 5 * 1024 * 1024;
const ALLOWED_COVER_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function parseCoverDataUrl(raw: string): Uint8Array | null {
  const trimmed = raw.trim();
  const m = /^data:([\w/+.-]+);base64,(.*)$/i.exec(trimmed);
  if (!m) {
    return null;
  }
  const mime = m[1].toLowerCase();
  if (!ALLOWED_COVER_MIME.has(mime)) {
    return null;
  }
  let buf: Buffer;
  try {
    buf = Buffer.from(m[2], "base64");
  } catch {
    return null;
  }
  if (buf.length === 0 || buf.length > MAX_COVER_BYTES) {
    return null;
  }
  return new Uint8Array(buf);
}

type PatchBody = {
  title?: string;
  excerpt?: string;
  body?: string;
  slug?: string;
  publishedAt?: string;
  gridCol?: number;
  gridRow?: number;
  coverImageAlt?: string | null;
  /** data:image/...;base64,... или `null`, чтобы удалить обложку */
  coverImageDataUrl?: string | null;
  showCoverOnHome?: boolean;
  /** true — на сайте, false — черновик */
  active?: boolean;
};

function parseGrid(n: unknown): 1 | 2 | undefined {
  if (n === 1 || n === 2) {
    return n;
  }
  if (typeof n === "string") {
    const v = parseInt(n, 10);
    if (v === 1 || v === 2) {
      return v;
    }
  }
  return undefined;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug: urlSlug } = await context.params;
  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const existing = await prisma.feedArticle.findUnique({
    where: { slug: urlSlug },
  });

  if (!existing) {
    return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
  }

  const nextSlug =
    typeof body.slug === "string" && body.slug.trim() !== ""
      ? body.slug.trim()
      : existing.slug;

  if (nextSlug !== existing.slug) {
    const taken = await prisma.feedArticle.findFirst({
      where: { slug: nextSlug, NOT: { id: existing.id } },
    });
    if (taken) {
      return NextResponse.json(
        { error: "Такой slug уже занят" },
        { status: 409 }
      );
    }
  }

  const gridCol = parseGrid(body.gridCol) ?? existing.gridCol;
  const gridRow = parseGrid(body.gridRow) ?? existing.gridRow;

  let publishedAt = existing.publishedAt;
  if (typeof body.publishedAt === "string" && body.publishedAt.length > 0) {
    const d = new Date(body.publishedAt);
    if (!Number.isNaN(d.getTime())) {
      publishedAt = d;
    }
  }

  let coverImage = existing.coverImage;
  let coverImageAlt =
    body.coverImageAlt === null || body.coverImageAlt === undefined
      ? existing.coverImageAlt
      : body.coverImageAlt.trim() === ""
        ? null
        : body.coverImageAlt.trim();

  let showCoverOnHome = existing.showCoverOnHome;
  if (typeof body.showCoverOnHome === "boolean") {
    showCoverOnHome = body.showCoverOnHome;
  }

  let active = existing.active;
  if (typeof body.active === "boolean") {
    active = body.active;
  }

  if (body.coverImageDataUrl === null) {
    coverImage = null;
    coverImageAlt = null;
    showCoverOnHome = false;
  } else if (typeof body.coverImageDataUrl === "string") {
    const parsed = parseCoverDataUrl(body.coverImageDataUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: "Некорректное изображение обложки (JPEG, PNG или WebP, до 5 МБ)" },
        { status: 400 }
      );
    }
    coverImage = Uint8Array.from(parsed);
  }

  const data = {
    slug: nextSlug,
    title:
      typeof body.title === "string" && body.title.trim() !== ""
        ? body.title.trim()
        : existing.title,
    excerpt:
      typeof body.excerpt === "string" ? body.excerpt.trim() : existing.excerpt,
    body:
      typeof body.body === "string" ? body.body : existing.body,
    publishedAt,
    gridCol,
    gridRow,
    coverImage,
    coverImageAlt,
    showCoverOnHome,
    active,
  };

  const updated = await prisma.feedArticle.update({
    where: { id: existing.id },
    data,
  });

  return NextResponse.json({
    ok: true,
    slug: updated.slug,
    id: updated.id,
  });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug: urlSlug } = await context.params;

  const existing = await prisma.feedArticle.findUnique({
    where: { slug: urlSlug },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
  }

  await prisma.feedArticle.delete({
    where: { id: existing.id },
  });

  return NextResponse.json({ ok: true });
}
