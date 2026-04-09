"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  MAX_ARTICLE_BODY_IMAGE_BYTES,
  MAX_ARTICLE_BODY_IMAGES_PER_POST,
} from "@/lib/article-body-image-limits";

import { PostBodyRichEditor } from "./PostBodyRichEditor";

const MAX_COVER_FILE_BYTES = 5 * 1024 * 1024;

type BodyImageItem = { id: string; path: string };

function bodyImagePublicPath(articleId: string, imageId: string): string {
  return `/api/articles/${articleId}/body-images/${imageId}`;
}

/** До отправки на сервер: часто пустой MIME или image/jpg — сервер проверяет по сигнатуре. */
function isClientAllowedImageFile(file: File): boolean {
  const t = file.type.toLowerCase().split(";")[0].trim();
  if (
    t &&
    /^image\/(jpe?g|pjpeg|png|webp|x-png)$/i.test(t)
  ) {
    return true;
  }
  if ((!t || t === "application/octet-stream") && /\.(jpe?g|png|webp)$/i.test(file.name)) {
    return true;
  }
  return false;
}

type CoverDraft =
  | { kind: "unchanged" }
  | { kind: "replace"; dataUrl: string }
  | { kind: "clear" };

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export type PostEditorInitial = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  publishedAt: string;
  gridCol: number;
  gridRow: number;
  coverImageAlt: string | null;
  hasCover: boolean;
  showCoverOnHome: boolean;
  /** false — черновик, не показывается на сайте (кроме предпросмотра админом) */
  active: boolean;
  bodyImageIds: string[];
};

function toDatetimeLocalValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type PostEditorFormProps = {
  post: PostEditorInitial;
};

export function PostEditorForm({ post }: PostEditorFormProps) {
  const router = useRouter();
  const [urlSlug] = useState(post.slug);
  const [slug, setSlug] = useState(post.slug);
  const [title, setTitle] = useState(post.title);
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [body, setBody] = useState(post.body);
  const [publishedAt, setPublishedAt] = useState(toDatetimeLocalValue(post.publishedAt));
  const [gridCol, setGridCol] = useState(String(post.gridCol));
  const [gridRow, setGridRow] = useState(String(post.gridRow));
  const [coverImageAlt, setCoverImageAlt] = useState(post.coverImageAlt ?? "");
  const [coverDraft, setCoverDraft] = useState<CoverDraft>({ kind: "unchanged" });
  const [coverPreviewNonce, setCoverPreviewNonce] = useState(0);
  const [showCoverOnHome, setShowCoverOnHome] = useState(post.showCoverOnHome);
  const [active, setActive] = useState(post.active);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error" | "deleting"
  >("idle");
  const [message, setMessage] = useState("");
  const [bodyImages, setBodyImages] = useState<BodyImageItem[]>(() =>
    post.bodyImageIds.map((id) => ({
      id,
      path: bodyImagePublicPath(post.id, id),
    })),
  );
  const [urlOrigin, setUrlOrigin] = useState("");
  /** file input только после mount — совпадает SSR и гидратация (кэш/HMR, расширения). */
  const [bodyImagesPickerMounted, setBodyImagesPickerMounted] = useState(false);

  useEffect(() => {
    setUrlOrigin(window.location.origin);
    setBodyImagesPickerMounted(true);
  }, []);

  const showCoverAlt =
    coverDraft.kind === "replace" ||
    (coverDraft.kind === "unchanged" && post.hasCover);

  const coverPreviewSrc =
    coverDraft.kind === "replace"
      ? coverDraft.dataUrl
      : coverDraft.kind === "clear"
        ? null
        : post.hasCover
          ? `/api/articles/${post.id}/cover?_=${coverPreviewNonce}`
          : null;

  async function onCoverFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) {
      return;
    }
    if (file.size > MAX_COVER_FILE_BYTES) {
      setStatus("error");
      setMessage("Файл обложки больше 5 МБ");
      return;
    }
    if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
      setStatus("error");
      setMessage("Допустимы только JPEG, PNG и WebP");
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setCoverDraft({ kind: "replace", dataUrl });
      setMessage("");
      setStatus("idle");
    } catch {
      setStatus("error");
      setMessage("Не удалось прочитать файл");
    }
  }

  async function onBodyImagesFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (list.length === 0) {
      return;
    }
    if (bodyImages.length + list.length > MAX_ARTICLE_BODY_IMAGES_PER_POST) {
      setStatus("error");
      setMessage(
        `Не больше ${MAX_ARTICLE_BODY_IMAGES_PER_POST} изображений на пост`,
      );
      return;
    }
    for (const file of list) {
      if (file.size > MAX_ARTICLE_BODY_IMAGE_BYTES) {
        setStatus("error");
        setMessage(`«${file.name}» больше 5 МБ`);
        return;
      }
      if (!isClientAllowedImageFile(file)) {
        setStatus("error");
        setMessage(
          `«${file.name}»: нужен JPEG, PNG или WebP (или пустой тип — тогда расширение .jpg/.jpeg/.png/.webp)`,
        );
        return;
      }
    }
    setMessage("");
    setStatus("idle");
    let nextCount = bodyImages.length;
    for (const file of list) {
      if (nextCount >= MAX_ARTICLE_BODY_IMAGES_PER_POST) {
        break;
      }
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch(
          `/api/admin/posts/${encodeURIComponent(urlSlug)}/body-images`,
          { method: "POST", body: fd, credentials: "same-origin" },
        );
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
          id?: string;
          url?: string;
        };
        if (!res.ok) {
          setStatus("error");
          setMessage(payload.error ?? "Ошибка загрузки изображения");
          return;
        }
        const newId = payload.id;
        const newUrl = payload.url;
        if (newId && newUrl) {
          setBodyImages((prev) => [
            ...prev,
            { id: newId, path: newUrl },
          ]);
          nextCount += 1;
        }
      } catch {
        setStatus("error");
        setMessage("Сеть недоступна при загрузке изображения");
        return;
      }
    }
  }

  async function onRemoveBodyImage(imageId: string) {
    const res = await fetch(
      `/api/admin/posts/${encodeURIComponent(urlSlug)}/body-images/${encodeURIComponent(imageId)}`,
      { method: "DELETE", credentials: "same-origin" },
    );
    const payload = (await res.json().catch(() => ({}))) as { error?: string };
    if (!res.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Не удалось удалить изображение");
      return;
    }
    setBodyImages((prev) => prev.filter((x) => x.id !== imageId));
    setMessage("");
    setStatus("idle");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setMessage("");

    if (coverDraft.kind === "replace" && coverImageAlt.trim() === "") {
      setStatus("error");
      setMessage("Укажите alt для новой обложки");
      return;
    }

    if (
      coverDraft.kind === "unchanged" &&
      post.hasCover &&
      coverImageAlt.trim() === ""
    ) {
      setStatus("error");
      setMessage("Укажите alt обложки или удалите изображение");
      return;
    }

    const col = parseInt(gridCol, 10);
    const row = parseInt(gridRow, 10);

    const patchBody: Record<string, unknown> = {
      slug,
      title,
      excerpt,
      body,
      publishedAt,
      gridCol: col === 1 || col === 2 ? col : undefined,
      gridRow: row === 1 || row === 2 ? row : undefined,
      coverImageAlt: coverImageAlt.trim() === "" ? null : coverImageAlt.trim(),
    };

    if (coverDraft.kind === "replace") {
      patchBody.coverImageDataUrl = coverDraft.dataUrl;
    } else if (coverDraft.kind === "clear") {
      patchBody.coverImageDataUrl = null;
    }

    patchBody.showCoverOnHome = showCoverOnHome;
    patchBody.active = active;

    const res = await fetch(`/api/admin/posts/${encodeURIComponent(urlSlug)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patchBody),
    });

    const payload = (await res.json().catch(() => ({}))) as {
      error?: string;
      slug?: string;
    };

    if (!res.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Ошибка сохранения");
      return;
    }

    setStatus("saved");
    setMessage("Сохранено");
    setCoverDraft({ kind: "unchanged" });
    setCoverPreviewNonce((n) => n + 1);

    if (payload.slug && payload.slug !== urlSlug) {
      router.replace(`/admin/${encodeURIComponent(payload.slug)}`);
      router.refresh();
      return;
    }

    router.refresh();
  }

  async function onDeletePost() {
    const ok = window.confirm(
      `Удалить пост «${title}»? Действие необратимо.`
    );
    if (!ok) {
      return;
    }

    setStatus("deleting");
    setMessage("");

    const res = await fetch(`/api/admin/posts/${encodeURIComponent(urlSlug)}`, {
      method: "DELETE",
    });

    const payload = (await res.json().catch(() => ({}))) as { error?: string };

    if (!res.ok) {
      setStatus("error");
      setMessage(payload.error ?? "Не удалось удалить пост");
      return;
    }

    router.push("/posts");
    router.refresh();
  }

  const busy = status === "saving" || status === "deleting";

  return (
    <form className="admin-editor" onSubmit={onSubmit}>
      <div className="admin-editor__toolbar">
        <Link className="admin-editor__link" href={`/posts/${slug}`}>
          Просмотр поста
        </Link>
        <Link className="admin-editor__link" href="/posts?all=1">
          Все посты
        </Link>
      </div>

      <label className="admin-editor__field">
        <span className="admin-editor__label">Slug (URL)</span>
        <input
          className="admin-editor__input"
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          autoComplete="off"
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

      <label className="admin-editor__field">
        <span className="admin-editor__label">Анонс</span>
        <textarea
          className="admin-editor__textarea admin-editor__textarea--short"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={3}
          required
        />
      </label>

      <div className="admin-editor__field">
        <label className="admin-editor__label" htmlFor="post-body-html">
          Текст поста (HTML)
        </label>
        <PostBodyRichEditor
          key={urlSlug}
          initialBody={post.body}
          onHtmlChange={setBody}
        />
      </div>

      <label className="admin-editor__field">
        <span className="admin-editor__label">Дата публикации</span>
        <input
          className="admin-editor__input"
          type="datetime-local"
          value={publishedAt}
          onChange={(e) => setPublishedAt(e.target.value)}
          required
        />
      </label>

      <div className="admin-editor__row">
        <label className="admin-editor__field admin-editor__field--inline">
          <span className="admin-editor__label">Колонки сетки (1–2)</span>
          <select
            className="admin-editor__select"
            value={gridCol}
            onChange={(e) => setGridCol(e.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </label>
        <label className="admin-editor__field admin-editor__field--inline">
          <span className="admin-editor__label">Строки сетки (1–2)</span>
          <select
            className="admin-editor__select"
            value={gridRow}
            onChange={(e) => setGridRow(e.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
          </select>
        </label>
      </div>

      <div className="admin-editor__field">
        <span className="admin-editor__label">Обложка</span>
        <div className="admin-editor__cover">
          {coverPreviewSrc ? (
            <div className="admin-editor__cover-preview">
              <img
                className="admin-editor__cover-img"
                src={coverPreviewSrc}
                alt={
                  coverDraft.kind === "replace"
                    ? ""
                    : coverImageAlt || "Обложка поста"
                }
              />
            </div>
          ) : (
            <p className="admin-editor__cover-empty">Обложка не задана</p>
          )}
          <div className="admin-editor__cover-actions">
            <label className="admin-editor__cover-file-label">
              <input
                className="admin-editor__cover-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={onCoverFileChange}
              />
              <span className="admin-editor__cover-file-btn">
                {coverPreviewSrc ? "Заменить файл" : "Загрузить изображение"}
              </span>
            </label>
            {(post.hasCover || coverDraft.kind === "replace") &&
            coverDraft.kind !== "clear" ? (
              <button
                className="admin-editor__cover-remove"
                type="button"
                onClick={() => {
                  setCoverDraft({ kind: "clear" });
                  setCoverImageAlt("");
                  setShowCoverOnHome(false);
                }}
              >
                Удалить обложку
              </button>
            ) : null}
          </div>
          <p className="admin-editor__cover-hint">
            JPEG, PNG или WebP, не больше 5 МБ.
          </p>
        </div>
      </div>

      {showCoverAlt ? (
        <label className="admin-editor__field">
          <span className="admin-editor__label">Alt обложки</span>
          <input
            className="admin-editor__input"
            type="text"
            value={coverImageAlt}
            onChange={(e) => setCoverImageAlt(e.target.value)}
            required={coverDraft.kind === "replace"}
            placeholder="Краткое описание изображения для доступности"
          />
        </label>
      ) : null}

      <div className="admin-editor__field">
        <span className="admin-editor__label">Картинки для HTML</span>
        <p className="admin-editor__body-images-lead">
          Загрузите одно или несколько изображений — под превью появится ссылка для
          вставки в текст поста (<code className="admin-editor__inline-code">
            &lt;img src=&quot;…&quot;&gt;
          </code>
          ).
        </p>
        <div className="admin-editor__cover-actions">
          {bodyImagesPickerMounted ? (
            <label className="admin-editor__cover-file-label">
              <input
                className="admin-editor__cover-file-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={
                  busy || bodyImages.length >= MAX_ARTICLE_BODY_IMAGES_PER_POST
                }
                onChange={onBodyImagesFileChange}
              />
              <span className="admin-editor__cover-file-btn">
                {bodyImages.length >= MAX_ARTICLE_BODY_IMAGES_PER_POST
                  ? "Лимит изображений"
                  : bodyImages.length > 0
                    ? "Добавить ещё"
                    : "Загрузить изображения"}
              </span>
            </label>
          ) : (
            <span
              className="admin-editor__cover-file-btn admin-editor__body-images-picker-placeholder"
              aria-hidden="true"
            >
              {bodyImages.length >= MAX_ARTICLE_BODY_IMAGES_PER_POST
                ? "Лимит изображений"
                : bodyImages.length > 0
                  ? "Добавить ещё"
                  : "Загрузить изображения"}
            </span>
          )}
        </div>
        <p className="admin-editor__cover-hint">
          JPEG, PNG или WebP, до 5 МБ каждое, не больше{" "}
          {MAX_ARTICLE_BODY_IMAGES_PER_POST} файлов.
        </p>
        {bodyImages.length > 0 ? (
          <ul
            className="admin-editor__body-images-list"
            aria-label="Загруженные иллюстрации"
          >
            {bodyImages.map((item) => {
              const href =
                urlOrigin !== "" ? `${urlOrigin}${item.path}` : item.path;
              return (
                <li key={item.id} className="admin-editor__body-images-item">
                  <img
                    className="admin-editor__body-images-thumb"
                    src={item.path}
                    alt=""
                  />
                  <div className="admin-editor__body-images-item-body">
                    <a
                      className="admin-editor__body-images-link"
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {href}
                    </a>
                    <button
                      className="admin-editor__body-images-remove"
                      type="button"
                      disabled={busy}
                      onClick={() => void onRemoveBodyImage(item.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>

      <label className="admin-editor__field admin-editor__field--checkbox">
        <input
          className="admin-editor__checkbox"
          type="checkbox"
          checked={showCoverOnHome}
          onChange={(e) => setShowCoverOnHome(e.target.checked)}
          disabled={
            coverDraft.kind === "clear" ||
            (!post.hasCover && coverDraft.kind !== "replace")
          }
        />
        <span className="admin-editor__checkbox-label">
          Показывать обложку в ленте на главной
        </span>
      </label>

      <label className="admin-editor__field admin-editor__field--checkbox">
        <input
          className="admin-editor__checkbox"
          type="checkbox"
          checked={!active}
          onChange={(e) => setActive(!e.target.checked)}
          disabled={busy}
        />
        <span className="admin-editor__checkbox-label">Черновик</span>
      </label>

      <div className="admin-editor__danger">
        <button
          className="admin-editor__delete"
          type="button"
          disabled={busy}
          onClick={onDeletePost}
        >
          {status === "deleting" ? "Удаление…" : "Удалить пост"}
        </button>
      </div>

      <div className="admin-editor__actions">
        <button
          className="admin-editor__submit"
          type="submit"
          disabled={busy}
        >
          {status === "saving" ? "Сохранение…" : "Сохранить"}
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
