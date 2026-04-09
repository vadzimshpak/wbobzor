-- CreateTable
CREATE TABLE "feed_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "publishedAt" DATETIME NOT NULL,
    "gridCol" INTEGER NOT NULL,
    "gridRow" INTEGER NOT NULL,
    "coverImage" BLOB,
    "coverImageAlt" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "feed_articles_slug_key" ON "feed_articles"("slug");
