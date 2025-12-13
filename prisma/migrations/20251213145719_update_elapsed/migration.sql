/*
  Warnings:

  - You are about to alter the column `amount` on the `BalanceRallyLog` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `Integer`.
  - You are about to alter the column `amount` on the `BalanceTradingLog` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `BigInt`.
  - You are about to alter the column `idr` on the `TradingData` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `BigInt`.
  - You are about to alter the column `usd` on the `TradingData` table. The data in that column could be lost. The data in that column will be cast from `Decimal(18,2)` to `BigInt`.

*/
-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('PENDING', 'PAUSED', 'RUNNING', 'FINISHED');

-- AlterTable
ALTER TABLE "BalanceRallyLog" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "BalanceTradingLog" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "MasterRally" ADD COLUMN     "duration" INTEGER NOT NULL DEFAULT 1200,
ADD COLUMN     "elapsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStartedAt" TIMESTAMP(3),
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "MasterTrading" ADD COLUMN     "elapsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastStartedAt" TIMESTAMP(3),
ADD COLUMN     "status" "GameStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "TradingData" ALTER COLUMN "idr" SET DEFAULT -10000000000,
ALTER COLUMN "idr" SET DATA TYPE BIGINT,
ALTER COLUMN "usd" SET DEFAULT 0,
ALTER COLUMN "usd" SET DATA TYPE BIGINT;
