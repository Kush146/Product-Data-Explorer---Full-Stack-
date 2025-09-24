/*
  Warnings:

  - A unique constraint covering the columns `[navigationId,slug,parentId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_navigationId_slug_key";

-- CreateIndex
CREATE UNIQUE INDEX "navigationId_slug_parentId" ON "Category"("navigationId", "slug", "parentId");
