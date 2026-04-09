import Image from "next/image";
import Link from "next/link";

import { getFeedArticlesFromDb, type FeedArticleView } from "@/lib/feed-db";

function formatPublished(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function itemClassName(article: FeedArticleView): string {
  const parts = ["feed__item"];
  if (article.gridSpan.col === 2) {
    parts.push("feed__item--col-2");
  }
  if (article.gridSpan.row === 2) {
    parts.push("feed__item--row-2");
  }
  return parts.join(" ");
}

function cardClassName(article: FeedArticleView): string {
  const parts = ["feed__card"];
  if (article.coverImage) {
    parts.push("feed__card--with-cover");
  }
  return parts.join(" ");
}

export async function Feed() {
  const articles = await getFeedArticlesFromDb();

  return (
    <section className="feed" aria-labelledby="home-feed-title">
      <h1 className="feed__title" id="home-feed-title">
        Лента
      </h1>
      <div className="feed__grid">
        {articles.map((article) => (
          <article key={article.id} className={itemClassName(article)}>
            <Link className={cardClassName(article)} href={`/posts/${article.slug}`}>
              {article.coverImage ? (
                <span className="feed__media">
                  <Image
                    className="feed__media-img"
                    src={article.coverImage.src}
                    alt={article.coverImage.alt}
                    fill
                    sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, min(50vw, 36rem)"
                    priority={article.id === "1"}
                  />
                </span>
              ) : null}
              <time
                className="feed__date"
                dateTime={article.publishedAt}
              >
                {formatPublished(article.publishedAt)}
              </time>
              <h2 className="feed__card-title">{article.title}</h2>
              <p className="feed__excerpt">{article.excerpt}</p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
