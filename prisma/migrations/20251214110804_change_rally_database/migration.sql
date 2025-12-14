/*
  Warnings:

  - You are about to drop the column `rallyDataId` on the `RallyActivityLog` table. All the data in the column will be lost.
  - You are about to drop the column `item_name` on the `RallyBigItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `RallyBigItem` table. All the data in the column will be lost.
  - You are about to drop the column `rally_data_id` on the `RallyBigItem` table. All the data in the column will be lost.
  - You are about to drop the column `eonix` on the `RallyData` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `RallyData` table. All the data in the column will be lost.
  - You are about to drop the column `minusPoint` on the `RallyData` table. All the data in the column will be lost.
  - You are about to drop the column `playedPosCount` on the `RallyData` table. All the data in the column will be lost.
  - You are about to drop the column `specialTicket` on the `RallyData` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RallyData` table. All the data in the column will be lost.
  - The `level_upgrade_cost_id` column on the `RallyData` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `item_name` on the `RallySmallItem` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `RallySmallItem` table. All the data in the column will be lost.
  - You are about to drop the column `rally_data_id` on the `RallySmallItem` table. All the data in the column will be lost.
  - You are about to drop the column `zone` on the `RallyZone` table. All the data in the column will be lost.
  - You are about to drop the `BigItemRecipe` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExchangeCostRally` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LevelUpgradeCost` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MasterRally` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PeriodeRally` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[user_id]` on the table `RallyData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `RallyActivityLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `RallyBigItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `RallyData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `RallySmallItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `RallyZone` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RallyPeriodStatus" AS ENUM ('NOT_STARTED', 'ON_GOING', 'ENDED');

-- DropForeignKey
ALTER TABLE "BigItemRecipe" DROP CONSTRAINT "BigItemRecipe_item_to_make_id_fkey";

-- DropForeignKey
ALTER TABLE "BigItemRecipe" DROP CONSTRAINT "BigItemRecipe_required_small_item_id_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeCostRally" DROP CONSTRAINT "ExchangeCostRally_periodeRally_id_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeCostRally" DROP CONSTRAINT "ExchangeCostRally_zoneRally_id_fkey";

-- DropForeignKey
ALTER TABLE "RallyActivityLog" DROP CONSTRAINT "RallyActivityLog_rallyDataId_fkey";

-- DropForeignKey
ALTER TABLE "RallyBigItem" DROP CONSTRAINT "RallyBigItem_rally_data_id_fkey";

-- DropForeignKey
ALTER TABLE "RallyData" DROP CONSTRAINT "RallyData_level_upgrade_cost_id_fkey";

-- DropForeignKey
ALTER TABLE "RallyData" DROP CONSTRAINT "RallyData_userId_fkey";

-- DropForeignKey
ALTER TABLE "RallySmallItem" DROP CONSTRAINT "RallySmallItem_rally_data_id_fkey";

-- DropIndex
DROP INDEX "RallyData_userId_key";

-- DropIndex
DROP INDEX "RallyZone_zone_key";

-- AlterTable
ALTER TABLE "RallyActivityLog" DROP COLUMN "rallyDataId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RallyBigItem" DROP COLUMN "item_name",
DROP COLUMN "quantity",
DROP COLUMN "rally_data_id",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RallyData" DROP COLUMN "eonix",
DROP COLUMN "level",
DROP COLUMN "minusPoint",
DROP COLUMN "playedPosCount",
DROP COLUMN "specialTicket",
DROP COLUMN "userId",
ADD COLUMN     "access_card_level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "enonix" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "minus_point" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "special_ticket" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "user_id" TEXT NOT NULL,
DROP COLUMN "level_upgrade_cost_id",
ADD COLUMN     "level_upgrade_cost_id" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "RallySmallItem" DROP COLUMN "item_name",
DROP COLUMN "quantity",
DROP COLUMN "rally_data_id",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RallyZone" DROP COLUMN "zone",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "BigItemRecipe";

-- DropTable
DROP TABLE "ExchangeCostRally";

-- DropTable
DROP TABLE "LevelUpgradeCost";

-- DropTable
DROP TABLE "MasterRally";

-- DropTable
DROP TABLE "PeriodeRally";

-- CreateTable
CREATE TABLE "RallyMaster" (
    "id" TEXT NOT NULL,
    "current_period_id" INTEGER NOT NULL DEFAULT 1,
    "special_ticket_stock" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "RallyMaster_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "access_card_upgrade_cost" (
    "id" SERIAL NOT NULL,
    "eonix_cost" INTEGER NOT NULL,
    "big_item_id" TEXT,
    "small_item_id" TEXT,
    "big_item_amount_required" INTEGER NOT NULL DEFAULT 0,
    "small_item_amount_required" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "access_card_upgrade_cost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallyPos" (
    "id" TEXT NOT NULL,
    "period_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,

    CONSTRAINT "RallyPos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallyPeriod" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "elapsed_time" INTEGER NOT NULL DEFAULT 0,
    "status" "RallyPeriodStatus" NOT NULL DEFAULT 'NOT_STARTED',

    CONSTRAINT "RallyPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallyBigItemRecipe" (
    "id" TEXT NOT NULL,
    "result_item_id" TEXT NOT NULL,
    "small_item_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "RallyBigItemRecipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBigItemInventory" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "big_item_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserBigItemInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSmallItemInventory" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "small_item_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "UserSmallItemInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RallyBigItemToRallySmallItem" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_RallyBigItemToRallySmallItem_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "RallyPeriod_name_key" ON "RallyPeriod"("name");

-- CreateIndex
CREATE INDEX "_RallyBigItemToRallySmallItem_B_index" ON "_RallyBigItemToRallySmallItem"("B");

-- CreateIndex
CREATE UNIQUE INDEX "RallyData_user_id_key" ON "RallyData"("user_id");

-- AddForeignKey
ALTER TABLE "access_card_upgrade_cost" ADD CONSTRAINT "access_card_upgrade_cost_big_item_id_fkey" FOREIGN KEY ("big_item_id") REFERENCES "RallyBigItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_card_upgrade_cost" ADD CONSTRAINT "access_card_upgrade_cost_small_item_id_fkey" FOREIGN KEY ("small_item_id") REFERENCES "RallySmallItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyPos" ADD CONSTRAINT "RallyPos_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "RallyZone"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyPos" ADD CONSTRAINT "RallyPos_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "RallyPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyData" ADD CONSTRAINT "RallyData_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyBigItemRecipe" ADD CONSTRAINT "RallyBigItemRecipe_result_item_id_fkey" FOREIGN KEY ("result_item_id") REFERENCES "RallyBigItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyBigItemRecipe" ADD CONSTRAINT "RallyBigItemRecipe_small_item_id_fkey" FOREIGN KEY ("small_item_id") REFERENCES "RallySmallItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBigItemInventory" ADD CONSTRAINT "UserBigItemInventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBigItemInventory" ADD CONSTRAINT "UserBigItemInventory_big_item_id_fkey" FOREIGN KEY ("big_item_id") REFERENCES "RallyBigItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSmallItemInventory" ADD CONSTRAINT "UserSmallItemInventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSmallItemInventory" ADD CONSTRAINT "UserSmallItemInventory_small_item_id_fkey" FOREIGN KEY ("small_item_id") REFERENCES "RallySmallItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyActivityLog" ADD CONSTRAINT "RallyActivityLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RallyBigItemToRallySmallItem" ADD CONSTRAINT "_RallyBigItemToRallySmallItem_A_fkey" FOREIGN KEY ("A") REFERENCES "RallyBigItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RallyBigItemToRallySmallItem" ADD CONSTRAINT "_RallyBigItemToRallySmallItem_B_fkey" FOREIGN KEY ("B") REFERENCES "RallySmallItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
