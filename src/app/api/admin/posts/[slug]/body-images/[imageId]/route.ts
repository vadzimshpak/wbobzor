import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string; imageId: string }> }
) {
  const { slug: urlSlug, imageId } = await context.params;

  const article = await prisma.feedArticle.findUnique({
    where: { slug: urlSlug },
    select: { id: true },
  });

  if (!article) {
    return NextResponse.json({ error: "Пост не найден" }, { status: 404 });
  }

  const existing = await prisma.articleBodyImage.findFirst({
    where: { id: imageId, articleId: article.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Изображение не найдено" }, { status: 404 });
  }

  await prisma.articleBodyImage.delete({
    where: { id: imageId },
  });

  return NextResponse.json({ ok: true });
}
