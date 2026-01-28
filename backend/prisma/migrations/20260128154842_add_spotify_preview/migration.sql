/*
  Warnings:

  - A unique constraint covering the columns `[spotifyId]` on the table `Song` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title,artist]` on the table `Song` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Song_title_key";

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "previewUrl" TEXT,
ADD COLUMN     "spotifyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Song_spotifyId_key" ON "Song"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "Song_title_artist_key" ON "Song"("title", "artist");
