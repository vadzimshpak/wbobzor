-- Посты с заполненным alt обложки считаем теми, у кого обложка была в ленте
UPDATE "feed_articles" SET "showCoverOnHome" = 1 WHERE "coverImageAlt" IS NOT NULL;
