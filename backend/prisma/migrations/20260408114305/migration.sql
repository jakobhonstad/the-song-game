/*
  Warnings:

  - The `status` column on the `games` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('LOBBY', 'PLAYING', 'ROUND_END', 'FINISHED');

-- AlterTable
ALTER TABLE "games" DROP COLUMN "status",
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'LOBBY';
