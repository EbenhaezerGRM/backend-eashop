/*
  Warnings:

  - Added the required column `addressId` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "addressId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "order_promos" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "promoId" INTEGER NOT NULL,
    "source" "PromoSource" NOT NULL,
    "voucherType" "VoucherType" NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_promos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_promos_promoId_idx" ON "order_promos"("promoId");

-- CreateIndex
CREATE UNIQUE INDEX "order_promos_orderId_promoId_key" ON "order_promos"("orderId", "promoId");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_promos" ADD CONSTRAINT "order_promos_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_promos" ADD CONSTRAINT "order_promos_promoId_fkey" FOREIGN KEY ("promoId") REFERENCES "promos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
