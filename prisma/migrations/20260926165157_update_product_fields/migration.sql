/*
  Warnings:

  - You are about to drop the column `productCode` on the `products` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "products_productCode_key";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "productCode",
ADD COLUMN     "description" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
