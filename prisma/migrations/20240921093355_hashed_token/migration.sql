/*
  Warnings:

  - The primary key for the `EmailVerificationToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `token` on the `EmailVerificationToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[hashedToken]` on the table `EmailVerificationToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hashedToken` to the `EmailVerificationToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "EmailVerificationToken_token_key";

-- AlterTable
ALTER TABLE "EmailVerificationToken" DROP CONSTRAINT "EmailVerificationToken_pkey",
DROP COLUMN "token",
ADD COLUMN     "hashedToken" TEXT NOT NULL,
ADD CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("hashedToken");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerificationToken_hashedToken_key" ON "EmailVerificationToken"("hashedToken");
