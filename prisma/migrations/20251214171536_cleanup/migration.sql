/*
  Warnings:

  - You are about to drop the column `elapsed` on the `MasterTrading` table. All the data in the column will be lost.
  - You are about to drop the column `lastStartedAt` on the `MasterTrading` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `MasterTrading` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MasterTrading" DROP COLUMN "elapsed",
DROP COLUMN "lastStartedAt",
DROP COLUMN "status";
