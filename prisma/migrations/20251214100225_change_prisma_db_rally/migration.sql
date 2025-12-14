/*
  Warnings:

  - You are about to drop the `BalanceRallyLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BigItemModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SmallItemModel` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ZoneRally` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BalanceRallyLog" DROP CONSTRAINT "BalanceRallyLog_rallyDataId_fkey";

-- DropForeignKey
ALTER TABLE "BigItemModel" DROP CONSTRAINT "BigItemModel_rallyDataId_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeCostRally" DROP CONSTRAINT "ExchangeCostRally_zoneRally_id_fkey";

-- DropForeignKey
ALTER TABLE "SmallItemModel" DROP CONSTRAINT "SmallItemModel_rallyDataId_fkey";

-- DropTable
DROP TABLE "BalanceRallyLog";

-- DropTable
DROP TABLE "BigItemModel";

-- DropTable
DROP TABLE "SmallItemModel";

-- DropTable
DROP TABLE "ZoneRally";

-- DropEnum
DROP TYPE "BalanceRallyResource";

-- DropEnum
DROP TYPE "BigItem";

-- DropEnum
DROP TYPE "SmallItem";

-- DropEnum
DROP TYPE "Zone";

-- CreateTable
CREATE TABLE "RallyZone" (
    "id" TEXT NOT NULL,
    "zone" TEXT NOT NULL,

    CONSTRAINT "RallyZone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BigItemRecipe" (
    "id" TEXT NOT NULL,
    "item_to_make_id" TEXT NOT NULL,
    "required_item_amt" INTEGER NOT NULL,
    "required_small_item_id" TEXT NOT NULL,

    CONSTRAINT "BigItemRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallyActivityLog" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "rallyDataId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RallyActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallySmallItem" (
    "id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "rally_data_id" TEXT NOT NULL,

    CONSTRAINT "RallySmallItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallyBigItem" (
    "id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "rally_data_id" TEXT NOT NULL,

    CONSTRAINT "RallyBigItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RallyZone_zone_key" ON "RallyZone"("zone");

-- AddForeignKey
ALTER TABLE "ExchangeCostRally" ADD CONSTRAINT "ExchangeCostRally_zoneRally_id_fkey" FOREIGN KEY ("zoneRally_id") REFERENCES "RallyZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BigItemRecipe" ADD CONSTRAINT "BigItemRecipe_item_to_make_id_fkey" FOREIGN KEY ("item_to_make_id") REFERENCES "RallyBigItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BigItemRecipe" ADD CONSTRAINT "BigItemRecipe_required_small_item_id_fkey" FOREIGN KEY ("required_small_item_id") REFERENCES "RallySmallItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyActivityLog" ADD CONSTRAINT "RallyActivityLog_rallyDataId_fkey" FOREIGN KEY ("rallyDataId") REFERENCES "RallyData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallySmallItem" ADD CONSTRAINT "RallySmallItem_rally_data_id_fkey" FOREIGN KEY ("rally_data_id") REFERENCES "RallyData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyBigItem" ADD CONSTRAINT "RallyBigItem_rally_data_id_fkey" FOREIGN KEY ("rally_data_id") REFERENCES "RallyData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
