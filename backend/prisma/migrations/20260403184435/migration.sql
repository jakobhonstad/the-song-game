/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Song` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SongCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SongCategory" DROP CONSTRAINT "SongCategory_category_id_fkey";

-- DropForeignKey
ALTER TABLE "SongCategory" DROP CONSTRAINT "SongCategory_song_id_fkey";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "Song";

-- DropTable
DROP TABLE "SongCategory";

-- CreateTable
CREATE TABLE "songs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "preview_url" TEXT,

    CONSTRAINT "songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "songCategories" (
    "id" SERIAL NOT NULL,
    "song_id" INTEGER NOT NULL,
    "category_id" INTEGER NOT NULL,
    "category_description" TEXT,

    CONSTRAINT "songCategories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "songs_title_artist_key" ON "songs"("title", "artist");

-- CreateIndex
CREATE UNIQUE INDEX "categories_category_key" ON "categories"("category");

-- AddForeignKey
ALTER TABLE "songCategories" ADD CONSTRAINT "songCategories_song_id_fkey" FOREIGN KEY ("song_id") REFERENCES "songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "songCategories" ADD CONSTRAINT "songCategories_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
