/*
  Warnings:

  - Added the required column `price` to the `CraftStockPeriod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `RawStockPeriod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CraftStockPeriod" ADD COLUMN     "price" BIGINT NOT NULL;

-- AlterTable
ALTER TABLE "RawStockPeriod" ADD COLUMN     "price" BIGINT NOT NULL;
