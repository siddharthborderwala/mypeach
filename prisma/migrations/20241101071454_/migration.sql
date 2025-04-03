/*
  Warnings:

  - A unique constraint covering the columns `[vendorId]` on the table `Design` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Design_vendorId_key" ON "Design"("vendorId");
