/*
  Warnings:

  - You are about to drop the column `elapsed_time` on the `RallyPeriod` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `RallyPeriod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `RallyPeriod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RallyPeriod" DROP COLUMN "elapsed_time",
ADD COLUMN     "endTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pausedTime" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "totalPausedDuration" INTEGER NOT NULL DEFAULT 0;
