/*
  Warnings:

  - You are about to alter the column `price` on the `CraftPeriod` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `price` on the `CraftStockPeriod` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `cost_map` on the `PeriodeTrading` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `price_map` on the `PeriodeTrading` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `usdidr_rate` on the `PeriodeTrading` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `price` on the `RawPeriod` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `price` on the `RawStockPeriod` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `idr` on the `TradingData` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.
  - You are about to alter the column `usd` on the `TradingData` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "CraftPeriod" ALTER COLUMN "price" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "CraftStockPeriod" ALTER COLUMN "price" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "PeriodeTrading" ALTER COLUMN "cost_map" SET DATA TYPE BIGINT,
ALTER COLUMN "price_map" SET DATA TYPE BIGINT,
ALTER COLUMN "usdidr_rate" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "RawPeriod" ALTER COLUMN "price" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "RawStockPeriod" ALTER COLUMN "price" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "TradingData" ALTER COLUMN "idr" SET DEFAULT -10000000000,
ALTER COLUMN "idr" SET DATA TYPE BIGINT,
ALTER COLUMN "usd" SET DEFAULT 0,
ALTER COLUMN "usd" SET DATA TYPE BIGINT;
