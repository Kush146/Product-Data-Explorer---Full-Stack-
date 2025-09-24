/*
  Warnings:

  - A unique constraint covering the columns `[sourceUrl]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "sourceUrl" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Category_sourceUrl_key" ON "Category"("sourceUrl");
