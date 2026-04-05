/*
  Warnings:

  - A unique constraint covering the columns `[category]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "SongCategory" ADD COLUMN     "category_description" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_category_key" ON "Category"("category");
