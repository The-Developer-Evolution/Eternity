/*
  Warnings:

  - Added the required column `level_upgrade_cost_id` to the `RallyData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RallyData" ADD COLUMN     "level_upgrade_cost_id" TEXT NOT NULL,
ADD COLUMN     "playedPosCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LevelUpgradeCost" (
    "id" TEXT NOT NULL,
    "eonix_cost" INTEGER NOT NULL,
    "big_item_required" INTEGER NOT NULL,
    "small_item_required" INTEGER NOT NULL,
    "require_one_of_each_big_item" BOOLEAN NOT NULL,

    CONSTRAINT "LevelUpgradeCost_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RallyData" ADD CONSTRAINT "RallyData_level_upgrade_cost_id_fkey" FOREIGN KEY ("level_upgrade_cost_id") REFERENCES "LevelUpgradeCost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
