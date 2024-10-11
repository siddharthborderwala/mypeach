/*
  Warnings:

  - You are about to drop the column `designId` on the `Orders` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_designId_fkey";

-- DropIndex
DROP INDEX "Orders_designId_idx";

-- AlterTable
ALTER TABLE "Orders" DROP COLUMN "designId";

-- CreateTable
CREATE TABLE "_DesignToOrders" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DesignToOrders_AB_unique" ON "_DesignToOrders"("A", "B");

-- CreateIndex
CREATE INDEX "_DesignToOrders_B_index" ON "_DesignToOrders"("B");

-- AddForeignKey
ALTER TABLE "_DesignToOrders" ADD CONSTRAINT "_DesignToOrders_A_fkey" FOREIGN KEY ("A") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignToOrders" ADD CONSTRAINT "_DesignToOrders_B_fkey" FOREIGN KEY ("B") REFERENCES "Orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
