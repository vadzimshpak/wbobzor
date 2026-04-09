import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  MAX_ARTICLE_BODY_IMAGE_BYTES,
  MAX_ARTICLE_BODY_IMAGES_PER_POST,
} from "@/lib/article-body-image-limits";
import {
  ALLOWED_ARTICLE_IMAGE_MIME,
  detectImageMimeFromBytes,
} from "@/lib/image-mime";
import { prisma } from "@/lib/prisma";

function formDataBlob(entry: FormDataEntryValue | null): Blob | null {
  if (entry === null || typeof entry === "string") {
    return null;
  }
  if (typeof entry !== "object" || !("arrayBuffer" in entry)) {
    return null;
  }
  const b = entry as Blob;
  if (typeof b.arrayBuffer !== "function" || typeof b.size !== "number") {
    return null;
  }
  return b;
}

function normalizeDeclaredImageMime(raw: string): string {
  const t = raw.toLowerCase().split(";")[0].trim();
  if (t === "image/jpg") {
    return "image/jpeg";
  }
  return t;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug: urlSlug } = await context.params;

  const article = await prisma.feedArticle.findUnique({
    where: { slug: urlSlug },
    select: { id: true },
  });

  if (!article) {
    return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
  }

  const count = await prisma.articleBodyImage.count({
    where: { articleId: article.id },
  });
  if (count >= MAX_ARTICLE_BODY_IMAGES_PER_POST) {
    return NextResponse.json(
      {
        error: `Не больше ${MAX_ARTICLE_BODY_IMAGES_PER_POST} изображений на пост`,
      },
      { status: 400 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Ожидается multipart/form-data" }, { status: 400 });
  }

  const blob = formDataBlob(formData.get("file"));
  if (!blob || blob.size === 0) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  if (blob.size > MAX_ARTICLE_BODY_IMAGE_BYTES) {
    return NextResponse.json(
      { error: "Файл больше 5 МБ" },
      { status: 400 }
    );
  }

  const buf = new Uint8Array(await blob.arrayBuffer());
  const detected = detectImageMimeFromBytes(buf);
  const declared = normalizeDeclaredImageMime(blob.type || "");
  const mime = ALLOWED_ARTICLE_IMAGE_MIME.has(declared)
    ? declared
    : detected;

  if (!ALLOWED_ARTICLE_IMAGE_MIME.has(mime)) {
    return NextResponse.json(
      { error: "Допустимы только JPEG, PNG и WebP" },
      { status: 400 }
    );
  }

  const id = randomUUID();

  await prisma.articleBodyImage.create({
    data: {
      id,
      articleId: article.id,
      mimeType: mime,
      data: Buffer.from(buf),
    },
  });

  return NextResponse.json({
    ok: true,
    id,
    url: `/api/articles/${article.id}/body-images/${id}`,
  });
}
