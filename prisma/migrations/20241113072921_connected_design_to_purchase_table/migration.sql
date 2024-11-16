-- AddForeignKey
ALTER TABLE "PurchasedDesign" ADD CONSTRAINT "PurchasedDesign_designId_fkey" FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE ON UPDATE CASCADE;
