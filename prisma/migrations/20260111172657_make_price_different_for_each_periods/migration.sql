/*
  Warnings:

  - You are about to drop the column `price` on the `CraftItem` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `RawItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CraftItem" DROP COLUMN "price";

-- AlterTable
ALTER TABLE "RawItem" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "RawPeriod" (
    "id" TEXT NOT NULL,
    "rawId" TEXT NOT NULL,
    "periode" INTEGER NOT NULL,
    "price" BIGINT NOT NULL,

    CONSTRAINT "RawPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftPeriod" (
    "id" TEXT NOT NULL,
    "craftId" TEXT NOT NULL,
    "periode" INTEGER NOT NULL,
    "price" BIGINT NOT NULL,

    CONSTRAINT "CraftPeriod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RawPeriod" ADD CONSTRAINT "RawPeriod_periode_fkey" FOREIGN KEY ("periode") REFERENCES "PeriodeTrading"("periode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawPeriod" ADD CONSTRAINT "RawPeriod_rawId_fkey" FOREIGN KEY ("rawId") REFERENCES "RawItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftPeriod" ADD CONSTRAINT "CraftPeriod_periode_fkey" FOREIGN KEY ("periode") REFERENCES "PeriodeTrading"("periode") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftPeriod" ADD CONSTRAINT "CraftPeriod_craftId_fkey" FOREIGN KEY ("craftId") REFERENCES "CraftItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
