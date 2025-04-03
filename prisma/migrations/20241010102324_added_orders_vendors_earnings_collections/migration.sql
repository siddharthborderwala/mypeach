-- AlterTable
ALTER TABLE "Design" ADD COLUMN     "collectionsId" TEXT;

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UPI" (
    "id" TEXT NOT NULL,
    "vpa" TEXT NOT NULL,
    "account_holder" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "UPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KYC" (
    "id" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,

    CONSTRAINT "KYC_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Orders" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "price" INTEGER NOT NULL,
    "bankReference" TEXT,
    "cashFreePaymentId" TEXT,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailableDesignsToDownload" (
    "id" TEXT NOT NULL,
    "designId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "upadtedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailableDesignsToDownload_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Earnings" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "designId" TEXT NOT NULL,

    CONSTRAINT "Earnings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_phone_key" ON "Vendor"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "UPI_vpa_key" ON "UPI"("vpa");

-- CreateIndex
CREATE INDEX "UPI_vendorId_idx" ON "UPI"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "KYC_pan_key" ON "KYC"("pan");

-- CreateIndex
CREATE UNIQUE INDEX "KYC_vendorId_key" ON "KYC"("vendorId");

-- CreateIndex
CREATE INDEX "KYC_vendorId_idx" ON "KYC"("vendorId");

-- CreateIndex
CREATE INDEX "Orders_designId_idx" ON "Orders"("designId");

-- CreateIndex
CREATE INDEX "Orders_userId_idx" ON "Orders"("userId");

-- CreateIndex
CREATE INDEX "Orders_vendorId_idx" ON "Orders"("vendorId");

-- CreateIndex
CREATE INDEX "AvailableDesignsToDownload_designId_idx" ON "AvailableDesignsToDownload"("designId");

-- CreateIndex
CREATE INDEX "AvailableDesignsToDownload_userId_idx" ON "AvailableDesignsToDownload"("userId");

-- CreateIndex
CREATE INDEX "Earnings_vendorId_idx" ON "Earnings"("vendorId");

-- CreateIndex
CREATE INDEX "Earnings_userId_idx" ON "Earnings"("userId");

-- CreateIndex
CREATE INDEX "Earnings_designId_idx" ON "Earnings"("designId");

-- CreateIndex
CREATE INDEX "Collections_userId_idx" ON "Collections"("userId");

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_collectionsId_fkey" FOREIGN KEY ("collectionsId") REFERENCES "Collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UPI" ADD CONSTRAINT "UPI_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KYC" ADD CONSTRAINT "KYC_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Orders" ADD CONSTRAINT "Orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailableDesignsToDownload" ADD CONSTRAINT "AvailableDesignsToDownload_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailableDesignsToDownload" ADD CONSTRAINT "AvailableDesignsToDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Earnings" ADD CONSTRAINT "Earnings_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collections" ADD CONSTRAINT "Collections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
