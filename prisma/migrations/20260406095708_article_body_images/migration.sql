-- CreateTable
CREATE TABLE "article_body_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BLOB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "article_body_images_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "feed_articles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "article_body_images_articleId_idx" ON "article_body_images"("articleId");
