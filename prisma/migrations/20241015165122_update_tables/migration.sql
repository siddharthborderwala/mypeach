/*
  Warnings:

  - You are about to drop the column `vendorId` on the `Order` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_vendorId_fkey";

-- DropIndex
DROP INDEX "Order_vendorId_idx";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "vendorId";

-- CreateTable
CREATE TABLE "_OrderToVendor" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_OrderToVendor_AB_unique" ON "_OrderToVendor"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderToVendor_B_index" ON "_OrderToVendor"("B");

-- AddForeignKey
ALTER TABLE "_OrderToVendor" ADD CONSTRAINT "_OrderToVendor_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToVendor" ADD CONSTRAINT "_OrderToVendor_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
