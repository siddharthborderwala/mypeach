/*
  Warnings:

  - You are about to drop the column `collectionsId` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the `Collections` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Collections" DROP CONSTRAINT "Collections_userId_fkey";

-- DropForeignKey
ALTER TABLE "Design" DROP CONSTRAINT "Design_collectionsId_fkey";

-- AlterTable
ALTER TABLE "Design" DROP COLUMN "collectionsId";

-- DropTable
DROP TABLE "Collections";

-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CollectionToDesign" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "Collection_userId_idx" ON "Collection"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "_CollectionToDesign_AB_unique" ON "_CollectionToDesign"("A", "B");

-- CreateIndex
CREATE INDEX "_CollectionToDesign_B_index" ON "_CollectionToDesign"("B");

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToDesign" ADD CONSTRAINT "_CollectionToDesign_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToDesign" ADD CONSTRAINT "_CollectionToDesign_B_fkey" FOREIGN KEY ("B") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;
