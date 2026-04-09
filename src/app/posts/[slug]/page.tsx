import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { hasAdminAccess } from "@/lib/admin-access";
import { getPostBySlug } from "@/lib/post-db";
import { SiteLayout } from "@/lib/layout";
import { sanitizePostBodyHtml } from "@/lib/post-body-html";
import { getSiteUrl } from "@/lib/site";

type Props = {
  params: Promise<{ slug: string }>;
};

/**
 * Страница зависит от cookies (админ-доступ) и может отдавать черновики.
 * Поэтому отключаем SSG и рендерим динамически.
 */
export const dynamic = "force-dynamic";
export const revalidate = 0;

function formatPublished(d: Date): string {
  return d.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Пост не найден" };
  }
  const isAdmin = await hasAdminAccess();
  if (!post.active && !isAdmin) {
    return { title: "Пост не найден" };
  }
  const base = getSiteUrl();
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt.toISOString(),
      url: `${base}/posts/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const canEditInAdmin = await hasAdminAccess();
  if (!post.active && !canEditInAdmin) {
    notFound();
  }

  const hasCover =
    post.coverImage && post.coverImage.length > 0 && post.coverImageAlt;
  const bodyHtml = sanitizePostBodyHtml(post.body);

  return (
    <SiteLayout>
      <article className="post" itemScope itemType="https://schema.org/Article">
        <nav className="post__nav" aria-label="Навигация по посту">
          <Link className="post__back" href="/">
            ← На главную
          </Link>
          {canEditInAdmin ? (
            <Link
              className="post__edit-admin"
              href={`/admin/${encodeURIComponent(post.slug)}`}
            >
              Редактировать
            </Link>
          ) : null}
        </nav>
        <p className="post__meta">
          <time dateTime={post.publishedAt.toISOString()} itemProp="datePublished">
            {formatPublished(post.publishedAt)}
          </time>
        </p>
        <h1 className="post__title" itemProp="headline">
          {post.title}
        </h1>
        <p className="post__lead" itemProp="description">
          {post.excerpt}
        </p>
        {hasCover ? (
          <div className="post__cover">
            <Image
              className="post__cover-img"
              src={`/api/articles/${post.id}/cover`}
              alt={post.coverImageAlt!}
              fill
              loading="eager"
              sizes="(max-width: 1200px) 100vw, 72rem"
            />
          </div>
        ) : null}
        {bodyHtml ? (
          <div
            className="post__body post__body--rich"
            itemProp="articleBody"
            dangerouslySetInnerHTML={{ __html: bodyHtml }}
          />
        ) : null}
      </article>
    </SiteLayout>
  );
}
