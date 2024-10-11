-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "failedReason" TEXT,
ADD COLUMN     "paymentFailed" BOOLEAN NOT NULL DEFAULT false;
