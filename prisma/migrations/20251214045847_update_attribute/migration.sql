-- AlterTable
ALTER TABLE "TradingData" ADD COLUMN     "isPlayedThunt" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "itemFromThunt" INTEGER NOT NULL DEFAULT 0;
