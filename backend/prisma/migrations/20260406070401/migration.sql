/*
  Warnings:

  - Changed the type of `song_id` on the `rounds` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "rounds" DROP COLUMN "song_id",
ADD COLUMN     "song_id" INTEGER NOT NULL;
