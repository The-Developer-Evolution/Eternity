/*
  Warnings:

  - Added the required column `special_ticket_name` to the `RallyPeriod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RallyPeriod" ADD COLUMN     "special_ticket_name" TEXT NOT NULL,
ADD COLUMN     "special_ticket_stock" INTEGER NOT NULL DEFAULT 5;
