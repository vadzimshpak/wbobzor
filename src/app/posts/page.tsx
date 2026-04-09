import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { hasAdminAccess } from "@/lib/admin-access";
import { SiteLayout } from "@/lib/layout";
import { getPostsIndexPage } from "@/lib/post-db";

import { PostPager } from "./PostPager";

export const metadata: Metadata = {
  title: "Все посты",
  description:
    "Список статей о нейросетях, машинном обучении и практическом применении ИИ.",
};

type Props = {
  searchParams: Promise<{ page?: string; all?: string }>;
};

function formatPublished(d: Date): string {
  return d.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function parsePage(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  if (Number.isNaN(n) || n < 1) {
    return 1;
  }
  return n;
}

export default async function PostsIndexPage({ searchParams }: Props) {
  const sp = await searchParams;
  const isAdmin = await hasAdminAccess();

  const requested = parsePage(sp.page);
  const { posts, page, totalPages } = await getPostsIndexPage(requested);

  if (requested !== page) {
    const q =
      sp.all === "1"
        ? page <= 1
          ? "?all=1"
          : `?page=${page}&all=1`
        : page <= 1
          ? ""
          : `?page=${page}`;
    redirect(`/posts${q}`);
  }

  return (
    <SiteLayout>
      <div className="post-list">
        <h1 className="post-list__title">Все посты</h1>
        {isAdmin ? (
          <p className="post-list__admin-new">
            <Link className="post-list__admin-new-link" href="/posts/new">
              + Новый пост
            </Link>
          </p>
        ) : null}
        <ul className="post-list__list">
          {posts.map((post) => (
            <li key={post.id} className="post-list__item">
              <Link className="post-list__link" href={`/posts/${post.slug}`}>
                <p className="post-list__item-meta">
                  <time dateTime={post.publishedAt.toISOString()}>
                    {formatPublished(post.publishedAt)}
                  </time>
                </p>
                <h2 className="post-list__item-title">{post.title}</h2>
                <p className="post-list__item-excerpt">{post.excerpt}</p>
              </Link>
            </li>
          ))}
        </ul>
        <PostPager
          page={page}
          totalPages={totalPages}
          adminList={sp.all === "1"}
        />
      </div>
    </SiteLayout>
  );
}
