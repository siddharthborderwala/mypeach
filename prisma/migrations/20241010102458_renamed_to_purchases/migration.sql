/*
  Warnings:

  - You are about to drop the `AvailableDesignsToDownload` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AvailableDesignsToDownload" DROP CONSTRAINT "AvailableDesignsToDownload_designId_fkey";

-- DropForeignKey
ALTER TABLE "AvailableDesignsToDownload" DROP CONSTRAINT "AvailableDesignsToDownload_userId_fkey";

-- DropTable
DROP TABLE "AvailableDesignsToDownload";

-- CreateTable
CREATE TABLE "Purchases" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadtedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Purchases_designId_idx" ON "Purchases"("designId");

-- CreateIndex
CREATE INDEX "Purchases_userId_idx" ON "Purchases"("userId");

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchases" ADD CONSTRAINT "Purchases_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
