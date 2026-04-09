# wbobzor

Сайт с обзорами товаров с Wildberries: главная с лентой карточек, список обзоров с пагинацией, страницы материалов с HTML‑текстом и обложками. Админка для создания и редактирования контента в браузере.

## Стек

- **Next.js** 16 (App Router), **React** 19, **TypeScript**
- **Sass** (модули стилей, BEM-классы)
- **Prisma** 6 + **SQLite** (`feed_articles`)
- **TipTap** — rich text в админке
- **isomorphic-dompurify** — санитизация HTML на публичных страницах

## Требования

- Node.js 20+
- npm или совместимый менеджер пакетов

## Переменные окружения

Создайте файл `.env` в корне проекта:

| Переменная | Обязательно | Описание |
|------------|-------------|----------|
| `DATABASE_URL` | да | URL SQLite, например `file:./prisma/dev.db` |
| `ADMIN_HASH` | для админки | Секретная строка; в cookie `admin_access` должно быть **то же значение** |
| `NEXT_PUBLIC_SITE_URL` | нет | Канонический URL сайта (sitemap, Open Graph, метаданные). Без завершающего `/` |

Без `ADMIN_HASH` маршруты `/admin/*`, `/posts/new` и `/api/admin/*` отвечают **404**.

## Установка и запуск

```bash
npm install
npx prisma migrate deploy   # или: npm run db:migrate
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000).

### Сборка для продакшена

```bash
npm run build
npm start
```

## База данных и сиды

- **Миграции:** `npm run db:migrate` (разработка) / `npx prisma migrate deploy` (прод)
- **Prisma Studio:** `npm run db:studio`
- **Сид:** `npm run db:seed` — ожидается модуль `src/content/home/feed-articles.ts` с массивом `FEED_ARTICLES` и при необходимости файлы обложек в `public/`. Если модуля нет, сид нужно отключить или добавить данные вручную.

## Скрипты npm

| Скрипт | Назначение |
|--------|------------|
| `dev` | Режим разработки Next.js |
| `build` | `prisma generate` + production build |
| `start` | Запуск собранного приложения |
| `db:generate` | Только Prisma Client |
| `db:migrate` | Миграции в режиме разработки |
| `db:push` | Синхронизация схемы без миграций (осторожно) |
| `db:seed` | Заполнение БД из сида |
| `db:studio` | GUI для SQLite |

## Админка

1. Задайте `ADMIN_HASH` в `.env`.
2. В браузере установите cookie **`admin_access`** со значением, **совпадающим** с `ADMIN_HASH` (Path `/`, срок по желанию).
3. Доступны:
   - **`/posts/new`** — создание поста (slug + заголовок), редирект в редактор;
   - **`/admin/[slug]`** — редактор полей, TipTap для тела, обложка, флаг «показывать обложку на главной», удаление поста.

У пользователей с cookie на странице поста показывается ссылка **«Редактировать»**.

Если админ открывает **`/posts`** без параметров, его перенаправляет на **`/posts/new`**. Список всех постов: **`/posts?all=1`**.

## Основные возможности

- Лента на главной с сеткой (колонки/строки из БД), обложки только если заданы файл, alt и **`showCoverOnHome`**.
- Публичные посты: HTML после DOMPurify, обложка через **`/api/articles/[id]/cover`**.
- Тёмная/светлая тема (переключатель в шапке, учёт `prefers-color-scheme`).
- Счётчик **Яндекс.Метрики** (см. `src/lib/analytics/YandexMetrika.tsx`).
- Ссылка на паблик VK в шапке (`public/logo/vk.svg`).
- Favicon: **`src/app/icon.svg`**.

## Структура проекта (кратко)

```
src/app/           — страницы и API routes (App Router)
src/lib/           — Prisma, БД, стили, layout, аналитика, админ-доступ
src/content/home/ — лента (Feed.tsx); сид — feed-articles (при наличии)
prisma/            — schema, миграции, seed.ts
public/            — статика (логотипы и т.д.)
```

## Лицензия

Приватный проект (`private: true` в `package.json`).
