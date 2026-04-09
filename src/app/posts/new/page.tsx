import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { hasAdminAccess } from "@/lib/admin-access";
import { SiteLayout } from "@/lib/layout";

import { NewPostForm, NewPostToolbar } from "./NewPostForm";

export const metadata: Metadata = {
  title: "Новый пост",
  robots: { index: false, follow: false },
};

export default async function NewPostPage() {
  if (!(await hasAdminAccess())) {
    notFound();
  }

  return (
    <SiteLayout>
      <div className="post-new">
        <NewPostToolbar />
        <h1 className="post-new__title">Новый пост</h1>
        <p className="post-new__lead">
          Задайте slug и заголовок, затем дополните материал в редакторе.
        </p>
        <NewPostForm />
      </div>
    </SiteLayout>
  );
}
