-- CreateEnum
CREATE TYPE "PromoSource" AS ENUM ('SELLER', 'PLATFORM');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateTable
CREATE TABLE "promos" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "source" "PromoSource" NOT NULL,
    "sellerId" INTEGER,
    "discountType" "DiscountType" NOT NULL,
    "discountValue" DECIMAL(12,2) NOT NULL,
    "minimumPurchase" INTEGER NOT NULL DEFAULT 0,
    "maximumDiscount" INTEGER,
    "isStackable" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "promos_source_sellerId_idx" ON "promos"("source", "sellerId");
