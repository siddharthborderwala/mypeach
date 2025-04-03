/*
  Warnings:

  - The primary key for the `Collections` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Collections` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `collectionsId` column on the `Design` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Earnings` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Earnings` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `KYC` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `KYC` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Purchases` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Purchases` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `UPI` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `UPI` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Vendor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Vendor` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `vendorId` on the `Earnings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vendorId` on the `KYC` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vendorId` on the `Orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `vendorId` on the `UPI` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Design" DROP CONSTRAINT "Design_collectionsId_fkey";

-- DropForeignKey
ALTER TABLE "Earnings" DROP CONSTRAINT "Earnings_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "KYC" DROP CONSTRAINT "KYC_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "UPI" DROP CONSTRAINT "UPI_vendorId_fkey";

-- AlterTable
ALTER TABLE "Collections" DROP CONSTRAINT "Collections_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Collections_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Design" DROP COLUMN "collectionsId",
ADD COLUMN     "collectionsId" INTEGER;

-- AlterTable
ALTER TABLE "Earnings" DROP CONSTRAINT "Earnings_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "vendorId",
ADD COLUMN     "vendorId" INTEGER NOT NULL,
ADD CONSTRAINT "Earnings_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "KYC" DROP CONSTRAINT "KYC_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "vendorId",
ADD COLUMN     "vendorId" INTEGER NOT NULL,
ADD CONSTRAINT "KYC_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "vendorId",
ADD COLUMN     "vendorId" INTEGER NOT NULL,
ADD CONSTRAINT "Orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Purchases" DROP CONSTRAINT "Purchases_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Purchases_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UPI" DROP CONSTRAINT "UPI_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "vendorId",
ADD COLUMN     "vendorId" INTEGER NOT NULL,
ADD CONSTRAINT "UPI_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE INDEX "Earnings_vendorId_idx" ON "Earnings"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "KYC_vendorId_key" ON "KYC"("vendorId");

-- CreateIndex
CREATE INDEX "KYC_vendorId_idx" ON "KYC"("vendorId");

-- CreateIndex
CREATE INDEX "Orders_vendorId_idx" ON "Orders"("vendorId");

-- CreateIndex
CREATE INDEX "UPI_vendorId_idx" ON "UPI"("vendorId");

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_collectionsId_fkey" FOREIGN KEY ("collectionsId") REFERENCES "Collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UPI" ADD CONSTRAINT "UPI_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
