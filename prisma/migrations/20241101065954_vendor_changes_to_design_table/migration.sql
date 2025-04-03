/*
  Warnings:

  - You are about to drop the column `userId` on the `Design` table. All the data in the column will be lost.
  - You are about to drop the column `orderExpiryTime` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `percentageSplitToVendor` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `_OrderToVendor` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `vendorId` to the `Design` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amount` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Design" DROP CONSTRAINT "Design_userId_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToVendor" DROP CONSTRAINT "_OrderToVendor_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrderToVendor" DROP CONSTRAINT "_OrderToVendor_B_fkey";

-- DropIndex
DROP INDEX "Design_userId_idx";

-- AlterTable
ALTER TABLE "Design" DROP COLUMN "userId",
ADD COLUMN     "vendorId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "orderExpiryTime",
DROP COLUMN "percentageSplitToVendor",
DROP COLUMN "price",
ADD COLUMN     "amount" INTEGER NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- DropTable
DROP TABLE "_OrderToVendor";

-- CreateIndex
CREATE INDEX "Design_vendorId_idx" ON "Design"("vendorId");

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
