"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewPostForm() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: slug.trim().toLowerCase(),
        title: title.trim(),
      }),
    });

    const payload = (await res.json().catch(() => ({}))) as {
      error?: string;
      slug?: string;
    };

    if (!res.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Не удалось создать пост");
      return;
    }

    if (payload.slug) {
      router.push(`/admin/${encodeURIComponent(payload.slug)}`);
      router.refresh();
    }
  }

  return (
    <form className="post-new__form" onSubmit={onSubmit}>
      <label className="admin-editor__field">
        <span className="admin-editor__label">Slug (URL)</span>
        <input
          className="admin-editor__input"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          autoComplete="off"
          placeholder="primer-posta"
          required
        />
      </label>
      <label className="admin-editor__field">
        <span className="admin-editor__label">Заголовок</span>
        <input
          className="admin-editor__input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <div className="post-new__actions">
        <button
          className="admin-editor__submit"
          type="submit"
          disabled={status === "saving"}
        >
          {status === "saving" ? "Создание…" : "Создать и открыть редактор"}
        </button>
        {message ? (
          <span
            className={
              status === "error"
                ? "admin-editor__status admin-editor__status--error"
                : "admin-editor__status"
            }
            role="status"
          >
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}

export function NewPostToolbar() {
  return (
    <div className="post-new__toolbar">
      <Link className="admin-editor__link" href="/posts?all=1">
        Все посты
      </Link>
      <Link className="admin-editor__link" href="/">
        На главную
      </Link>
    </div>
  );
}
