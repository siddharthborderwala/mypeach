/*
  Warnings:

  - Added the required column `status` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "status" TEXT NOT NULL;
