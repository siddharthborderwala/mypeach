-- CreateTable
CREATE TABLE "DesignDownload" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "designId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "DesignDownload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesignDownload_designId_idx" ON "DesignDownload"("designId");

-- CreateIndex
CREATE INDEX "DesignDownload_userId_idx" ON "DesignDownload"("userId");

-- AddForeignKey
ALTER TABLE "DesignDownload" ADD CONSTRAINT "DesignDownload_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignDownload" ADD CONSTRAINT "DesignDownload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
