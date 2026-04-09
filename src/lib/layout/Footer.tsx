import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__row">
          <p className="site-footer__copy">
            © {year} wbobzor — обзоры товаров Wildberries
          </p>
          <Link
            className="site-footer__link"
            href="/sitemap.xml"
            prefetch={false}
          >
            Карта сайта (XML)
          </Link>
        </div>
      </div>
    </footer>
  );
}
