-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_feed_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "publishedAt" DATETIME NOT NULL,
    "gridCol" INTEGER NOT NULL,
    "gridRow" INTEGER NOT NULL,
    "coverImage" BLOB,
    "coverImageAlt" TEXT,
    "showCoverOnHome" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_feed_articles" ("coverImage", "coverImageAlt", "excerpt", "gridCol", "gridRow", "id", "publishedAt", "showCoverOnHome", "slug", "text", "title") SELECT "coverImage", "coverImageAlt", "excerpt", "gridCol", "gridRow", "id", "publishedAt", "showCoverOnHome", "slug", "text", "title" FROM "feed_articles";
DROP TABLE "feed_articles";
ALTER TABLE "new_feed_articles" RENAME TO "feed_articles";
CREATE UNIQUE INDEX "feed_articles_slug_key" ON "feed_articles"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
