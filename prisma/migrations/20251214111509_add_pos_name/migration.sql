/*
  Warnings:

  - Added the required column `name` to the `RallyPos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "RallyPos" ADD COLUMN     "name" TEXT NOT NULL;
