-- AlterTable
ALTER TABLE "Orders" ADD COLUMN     "cashFreeOrderId" TEXT,
ADD COLUMN     "orderExpiryTime" TIMESTAMP(3),
ADD COLUMN     "paymentSessionId" TEXT,
ADD COLUMN     "percentageSplitToVendor" INTEGER;
