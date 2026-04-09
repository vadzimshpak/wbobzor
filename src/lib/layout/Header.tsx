import Link from "next/link";

import { ThemeToggle } from "./ThemeToggle";

const VK_HREF = "https://vk.com/wbobzor";
const VK_ICON_SRC = "/logo/vk.svg";

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link className="site-header__logo flex items-center gap-2" href="/">
          <img
            className="site-header__logo-icon"
            src="/logo/wb.svg"
            alt="вб"
            width={22}
            height={22}
            decoding="async"
          />
          обзор
        </Link>
        <div className="site-header__end">
          <nav className="site-header__nav" aria-label="Основная навигация">
            <ul className="site-header__list">
              <li className="site-header__item">
                <Link className="site-header__link" href="/">
                  Главная
                </Link>
              </li>
              <li className="site-header__item">
                <Link className="site-header__link" href="/posts">
                  Посты
                </Link>
              </li>
            </ul>
          </nav>
          {/* <a
            className="site-header__vk"
            href={VK_HREF}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ВКонтакте — wbobzor"
          >
            <img
              className="site-header__vk-icon"
              src={VK_ICON_SRC}
              alt=""
              width={22}
              height={22}
              decoding="async"
            />
          </a> */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
