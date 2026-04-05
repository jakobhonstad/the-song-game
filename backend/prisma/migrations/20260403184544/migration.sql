/*
  Warnings:

  - You are about to drop the `songCategories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "songCategories" DROP CONSTRAINT "songCategories_category_id_fkey";

-- DropForeignKey
ALTER TABLE "songCategories" DROP CONSTRAINT "songCategories_song_id_fkey";

-- DropTable
DROP TABLE "songCategories";

-- CreateTable
CREATE TABLE "song_categories" (
    "id" SERIAL NOT NULL,
    "song_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "category_description" TEXT,

    CONSTRAINT "song_categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "song_categories" ADD CONSTRAINT "song_categories_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "song_categories" ADD CONSTRAINT "song_categories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
