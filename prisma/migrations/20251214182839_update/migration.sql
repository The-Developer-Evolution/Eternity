/*
  Warnings:

  - You are about to drop the column `tradingDataId` on the `CraftItem` table. All the data in the column will be lost.
  - You are about to drop the column `tradingDataId` on the `RawItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CraftItem" DROP CONSTRAINT "CraftItem_tradingDataId_fkey";

-- DropForeignKey
ALTER TABLE "RawItem" DROP CONSTRAINT "RawItem_tradingDataId_fkey";

-- AlterTable
ALTER TABLE "CraftItem" DROP COLUMN "tradingDataId",
ADD COLUMN     "price" BIGINT NOT NULL DEFAULT 3000;

-- AlterTable
ALTER TABLE "RawItem" DROP COLUMN "tradingDataId",
ADD COLUMN     "price" BIGINT NOT NULL DEFAULT 3000;

-- CreateTable
CREATE TABLE "RawUserAmount" (
    "id" TEXT NOT NULL,
    "tradingDataId" TEXT NOT NULL,
    "rawItemId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,

    CONSTRAINT "RawUserAmount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftUserAmount" (
    "id" TEXT NOT NULL,
    "tradingDataId" TEXT NOT NULL,
    "craftItemId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,

    CONSTRAINT "CraftUserAmount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftStockPeriod" (
    "id" TEXT NOT NULL,
    "craftId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "periode" INTEGER NOT NULL,

    CONSTRAINT "CraftStockPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawStockPeriod" (
    "id" TEXT NOT NULL,
    "rawId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL,
    "periode" INTEGER NOT NULL,

    CONSTRAINT "RawStockPeriod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RawUserAmount" ADD CONSTRAINT "RawUserAmount_tradingDataId_fkey" FOREIGN KEY ("tradingDataId") REFERENCES "TradingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawUserAmount" ADD CONSTRAINT "RawUserAmount_rawItemId_fkey" FOREIGN KEY ("rawItemId") REFERENCES "RawItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftUserAmount" ADD CONSTRAINT "CraftUserAmount_tradingDataId_fkey" FOREIGN KEY ("tradingDataId") REFERENCES "TradingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftUserAmount" ADD CONSTRAINT "CraftUserAmount_craftItemId_fkey" FOREIGN KEY ("craftItemId") REFERENCES "CraftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftStockPeriod" ADD CONSTRAINT "CraftStockPeriod_periode_fkey" FOREIGN KEY ("periode") REFERENCES "PeriodeTrading"("periode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftStockPeriod" ADD CONSTRAINT "CraftStockPeriod_craftId_fkey" FOREIGN KEY ("craftId") REFERENCES "CraftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawStockPeriod" ADD CONSTRAINT "RawStockPeriod_periode_fkey" FOREIGN KEY ("periode") REFERENCES "PeriodeTrading"("periode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawStockPeriod" ADD CONSTRAINT "RawStockPeriod_rawId_fkey" FOREIGN KEY ("rawId") REFERENCES "RawItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
