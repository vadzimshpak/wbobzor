import { readFileSync } from "node:fs";
import { join } from "node:path";

import { PrismaClient } from "@prisma/client";

import { FEED_ARTICLES } from "../src/content/home/feed-articles";

const prisma = new PrismaClient();

async function main() {
  for (const article of FEED_ARTICLES) {
    let coverImage: Buffer | null = null;
    let coverImageAlt: string | null = null;

    if (article.coverImage) {
      const filePath = join(
        process.cwd(),
        "public",
        article.coverImage.src.replace(/^\//, "")
      );
      coverImage = readFileSync(filePath);
      coverImageAlt = article.coverImage.alt;
    }

    const showCoverOnHome = Boolean(coverImage && coverImageAlt);

    await prisma.feedArticle.upsert({
      where: { id: article.id },
      create: {
        id: article.id,
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: article.excerpt,
        publishedAt: new Date(`${article.publishedAt}T12:00:00.000Z`),
        gridCol: article.gridSpan.col,
        gridRow: article.gridSpan.row,
        coverImage,
        coverImageAlt,
        showCoverOnHome,
        active: true,
      },
      update: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: article.excerpt,
        publishedAt: new Date(`${article.publishedAt}T12:00:00.000Z`),
        gridCol: article.gridSpan.col,
        gridRow: article.gridSpan.row,
        coverImage,
        coverImageAlt,
        showCoverOnHome,
        active: true,
      },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
