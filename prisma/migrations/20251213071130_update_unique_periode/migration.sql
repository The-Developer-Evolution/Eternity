/*
  Warnings:

  - A unique constraint covering the columns `[periode]` on the table `PeriodeRally` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[periode]` on the table `PeriodeTrading` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PeriodeRally_periode_key" ON "PeriodeRally"("periode");

-- CreateIndex
CREATE UNIQUE INDEX "PeriodeTrading_periode_key" ON "PeriodeTrading"("periode");
