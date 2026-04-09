import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type PostCreateBody = {
  slug?: string;
  title?: string;
};

export async function POST(request: Request) {
  let body: PostCreateBody;
  try {
    body = (await request.json()) as PostCreateBody;
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 });
  }

  const slug =
    typeof body.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!slug || !title) {
    return NextResponse.json(
      { error: "Укажите slug и заголовок" },
      { status: 400 }
    );
  }

  if (slug.length > 200 || !SLUG_RE.test(slug)) {
    return NextResponse.json(
      {
        error:
          "Slug: строчные латинские буквы, цифры и дефисы (например: moy-post)",
      },
      { status: 400 }
    );
  }

  const taken = await prisma.feedArticle.findUnique({
    where: { slug },
    select: { id: true },
  });
  if (taken) {
    return NextResponse.json({ error: "Такой slug уже занят" }, { status: 409 });
  }

  const id = randomUUID();
  const now = new Date();

  await prisma.feedArticle.create({
    data: {
      id,
      slug,
      title,
      excerpt: "",
      body: "",
      publishedAt: now,
      gridCol: 1,
      gridRow: 1,
      showCoverOnHome: false,
      active: false,
    },
  });

  return NextResponse.json({ ok: true, slug, id });
}
