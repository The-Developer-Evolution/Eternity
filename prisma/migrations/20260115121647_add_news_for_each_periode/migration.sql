/*
  Warnings:

  - Added the required column `news` to the `PeriodeTrading` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PeriodeTrading" ADD COLUMN     "news" TEXT NOT NULL;
