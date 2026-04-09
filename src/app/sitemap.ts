import type { MetadataRoute } from "next";

import { prisma } from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site";

/** Иначе URL постов фиксируются на момент `next build`. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const home: MetadataRoute.Sitemap[number] = {
    url: base,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1,
  };

  const rows = await prisma.feedArticle.findMany({
    where: { active: true },
    select: { slug: true, publishedAt: true },
  });

  const posts: MetadataRoute.Sitemap = rows.map((article) => ({
    url: `${base}/posts/${article.slug}`,
    lastModified: article.publishedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [home, ...posts];
}
