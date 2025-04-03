/*
  Warnings:

  - You are about to drop the `Orders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DesignToOrders` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_userId_fkey";

-- DropForeignKey
ALTER TABLE "Orders" DROP CONSTRAINT "Orders_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "_DesignToOrders" DROP CONSTRAINT "_DesignToOrders_A_fkey";

-- DropForeignKey
ALTER TABLE "_DesignToOrders" DROP CONSTRAINT "_DesignToOrders_B_fkey";

-- DropTable
DROP TABLE "Orders";

-- DropTable
DROP TABLE "_DesignToOrders";

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "paymentSessionId" TEXT,
    "cashFreeOrderId" TEXT,
    "percentageSplitToVendor" INTEGER,
    "orderExpiryTime" TIMESTAMP(3),
    "bankReference" TEXT,
    "cashFreePaymentId" TEXT,
    "paymentFailed" BOOLEAN NOT NULL DEFAULT false,
    "failedReason" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DesignToOrder" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_vendorId_idx" ON "Order"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "_DesignToOrder_AB_unique" ON "_DesignToOrder"("A", "B");

-- CreateIndex
CREATE INDEX "_DesignToOrder_B_index" ON "_DesignToOrder"("B");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignToOrder" ADD CONSTRAINT "_DesignToOrder_A_fkey" FOREIGN KEY ("A") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DesignToOrder" ADD CONSTRAINT "_DesignToOrder_B_fkey" FOREIGN KEY ("B") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
