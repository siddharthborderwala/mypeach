/*
  Warnings:

  - You are about to drop the `_CollectionToDesign` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_CollectionToDesign" DROP CONSTRAINT "_CollectionToDesign_A_fkey";

-- DropForeignKey
ALTER TABLE "_CollectionToDesign" DROP CONSTRAINT "_CollectionToDesign_B_fkey";

-- DropTable
DROP TABLE "_CollectionToDesign";

-- CreateTable
CREATE TABLE "CollectionItem" (
    "collectionId" INTEGER NOT NULL,
    "designId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CollectionItem_collectionId_designId_key" ON "CollectionItem"("collectionId", "designId");

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollectionItem" ADD CONSTRAINT "CollectionItem_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;
