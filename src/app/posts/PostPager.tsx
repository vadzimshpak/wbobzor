import Link from "next/link";

type PostPagerProps = {
  page: number;
  totalPages: number;
  /** Сохранить ?all=1 в ссылках (режим списка для админа) */
  adminList?: boolean;
};

function hrefForPage(p: number, adminList: boolean): string {
  if (p <= 1) {
    return adminList ? "/posts?all=1" : "/posts";
  }
  return adminList ? `/posts?page=${p}&all=1` : `/posts?page=${p}`;
}

export function PostPager({ page, totalPages, adminList = false }: PostPagerProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="post-pager" aria-label="Страницы списка постов">
      <ul className="post-pager__list">
        <li className="post-pager__item">
          {page > 1 ? (
            <Link
              className="post-pager__link"
              href={hrefForPage(page - 1, adminList)}
              prefetch={false}
            >
              Назад
            </Link>
          ) : (
            <span className="post-pager__link post-pager__link--disabled">Назад</span>
          )}
        </li>
        {pages.map((p) => (
          <li key={p} className="post-pager__item">
            {p === page ? (
              <span
                className="post-pager__link post-pager__link--current"
                aria-current="page"
              >
                {p}
              </span>
            ) : (
              <Link
                className="post-pager__link"
                href={hrefForPage(p, adminList)}
                prefetch={false}
              >
                {p}
              </Link>
            )}
          </li>
        ))}
        <li className="post-pager__item">
          {page < totalPages ? (
            <Link
              className="post-pager__link"
              href={hrefForPage(page + 1, adminList)}
              prefetch={false}
            >
              Вперёд
            </Link>
          ) : (
            <span className="post-pager__link post-pager__link--disabled">Вперёд</span>
          )}
        </li>
      </ul>
    </nav>
  );
}
