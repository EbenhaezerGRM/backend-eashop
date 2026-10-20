-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "productCode" VARCHAR(20) NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "products_productCode_key" ON "products"("productCode");
