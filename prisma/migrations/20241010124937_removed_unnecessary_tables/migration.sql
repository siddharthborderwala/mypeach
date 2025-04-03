/*
  Warnings:

  - You are about to drop the `Earnings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Purchases` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[vendorId]` on the table `UPI` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Earnings" DROP CONSTRAINT "Earnings_designId_fkey";

-- DropForeignKey
ALTER TABLE "Earnings" DROP CONSTRAINT "Earnings_userId_fkey";

-- DropForeignKey
ALTER TABLE "Earnings" DROP CONSTRAINT "Earnings_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_designId_fkey";

-- DropForeignKey
ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_userId_fkey";

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "totalEarnings" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "Earnings";

-- DropTable
DROP TABLE "Purchases";

-- CreateIndex
CREATE UNIQUE INDEX "UPI_vendorId_key" ON "UPI"("vendorId");
