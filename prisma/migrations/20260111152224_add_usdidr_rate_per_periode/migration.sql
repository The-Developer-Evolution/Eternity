/*
  Warnings:

  - Added the required column `usdidr_rate` to the `PeriodeTrading` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PeriodeTrading" ADD COLUMN     "usdidr_rate" INTEGER NOT NULL;
