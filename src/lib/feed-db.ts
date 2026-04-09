import { prisma } from "@/lib/prisma";

export type FeedArticleView = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  gridSpan: { col: 1 | 2; row: 1 | 2 };
  coverImage?: { src: string; alt: string };
};

export async function getFeedArticlesFromDb(): Promise<FeedArticleView[]> {
  const rows = await prisma.feedArticle.findMany({
    where: { active: true },
    orderBy: { publishedAt: "desc" },
  });

  return rows.map((row) => {
    const view: FeedArticleView = {
      id: row.id,
      slug: row.slug,
      title: row.title,
      excerpt: row.excerpt,
      publishedAt: row.publishedAt.toISOString().slice(0, 10),
      gridSpan: {
        col: row.gridCol as 1 | 2,
        row: row.gridRow as 1 | 2,
      },
    };

    if (
      row.showCoverOnHome &&
      row.coverImage &&
      row.coverImage.length > 0 &&
      row.coverImageAlt
    ) {
      view.coverImage = {
        src: `/api/articles/${row.id}/cover`,
        alt: row.coverImageAlt,
      };
    }

    return view;
  });
}
