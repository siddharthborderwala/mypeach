/*
  Warnings:

  - You are about to drop the column `account_holder` on the `UPI` table. All the data in the column will be lost.
  - Added the required column `accountHolder` to the `UPI` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UPI" DROP COLUMN "account_holder",
ADD COLUMN     "accountHolder" TEXT NOT NULL;
