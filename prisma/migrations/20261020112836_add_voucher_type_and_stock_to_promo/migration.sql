-- CreateEnum
CREATE TYPE "VoucherType" AS ENUM ('DISCOUNT', 'FREE_SHIPPING');

-- AlterTable
ALTER TABLE "promos" ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "voucherType" "VoucherType" NOT NULL DEFAULT 'DISCOUNT';
