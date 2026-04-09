import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SiteLayout } from "@/lib/layout";
import { getArticleBodyImageIds, getPostBySlug } from "@/lib/post-db";

import { PostEditorForm } from "./PostEditorForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Редактор" };
  }
  return {
    title: `Редактирование: ${post.title}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminPostEditorPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const bodyImageIds = await getArticleBodyImageIds(post.id);

  return (
    <SiteLayout>
      <div className="admin-editor-page">
        <h1 className="admin-editor-page__title">Редактор поста</h1>
        <p className="admin-editor-page__id">id: {post.id}</p>
        <PostEditorForm
          post={{
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt,
            body: post.body,
            publishedAt: post.publishedAt.toISOString(),
            gridCol: post.gridCol,
            gridRow: post.gridRow,
            coverImageAlt: post.coverImageAlt,
            hasCover: Boolean(post.coverImage && post.coverImage.length > 0),
            showCoverOnHome: post.showCoverOnHome,
            active: post.active,
            bodyImageIds,
          }}
        />
      </div>
    </SiteLayout>
  );
}
