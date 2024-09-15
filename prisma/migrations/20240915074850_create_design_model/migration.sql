-- CreateTable
CREATE TABLE "Design" (
    "id" TEXT NOT NULL,
    "originalFileStorageKey" TEXT NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "originalFileType" TEXT NOT NULL DEFAULT 'image/tiff',
    "thumbnailFileStorageKey" TEXT,
    "thumbnailFileType" TEXT DEFAULT 'image/jpeg',
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Design_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Design_originalFileStorageKey_key" ON "Design"("originalFileStorageKey");

-- CreateIndex
CREATE UNIQUE INDEX "Design_thumbnailFileStorageKey_key" ON "Design"("thumbnailFileStorageKey");

-- AddForeignKey
ALTER TABLE "Design" ADD CONSTRAINT "Design_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
