-- CreateEnum
CREATE TYPE "BalanceLogType" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "BalanceTradingResource" AS ENUM ('IDR', 'USD', 'ETERNITES', 'RAW', 'CRAFT', 'MAP');

-- CreateEnum
CREATE TYPE "AdminTradingRole" AS ENUM ('SUPER', 'SELL', 'BUYRAW', 'CRAFT', 'MAP', 'BLACKMARKET', 'PITCHING', 'CURRENCY', 'THUNT');

-- CreateEnum
CREATE TYPE "BalanceRallyResource" AS ENUM ('POINT', 'MINPOINT', 'EONIX', 'VAULT', 'ETSIGIL', 'CHROKEY', 'COFRAG', 'SIGIL', 'SHARD', 'CHRONO', 'RUNE', 'FRAGMENT', 'FLUX', 'TICKET', 'ZONECARD', 'STICKET');

-- CreateEnum
CREATE TYPE "AdminRallyRole" AS ENUM ('EXCHANGE', 'UPGRADE', 'POSTGUARD', 'MONSTER');

-- CreateEnum
CREATE TYPE "SmallItem" AS ENUM ('SHARDS', 'RUNE', 'FLUX', 'SIGIL', 'CHRONO', 'FRAGMENT');

-- CreateEnum
CREATE TYPE "BigItem" AS ENUM ('ETERGIL', 'CHROKEY', 'COFRAG');

-- CreateEnum
CREATE TYPE "Zone" AS ENUM ('AMERIKA', 'ASIA', 'EROPA', 'AFRIKA');

-- CreateTable
CREATE TABLE "PeriodeTrading" (
    "id" TEXT NOT NULL,
    "periode" INTEGER NOT NULL,
    "cost_map" INTEGER NOT NULL,
    "price_map" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,

    CONSTRAINT "PeriodeTrading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterTrading" (
    "id" TEXT NOT NULL,
    "current_periode" INTEGER NOT NULL,

    CONSTRAINT "MasterTrading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nim" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TradingData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idr" DECIMAL(18,2) NOT NULL,
    "usd" DECIMAL(18,2) NOT NULL,
    "eternites" INTEGER NOT NULL,
    "map" INTEGER NOT NULL,
    "point" INTEGER NOT NULL,

    CONSTRAINT "TradingData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawItem" (
    "id" TEXT NOT NULL,
    "tradingDataId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "RawItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CraftItem" (
    "id" TEXT NOT NULL,
    "tradingDataId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "CraftItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceTradingLog" (
    "id" TEXT NOT NULL,
    "tradingDataId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "BalanceLogType" NOT NULL,
    "resource" "BalanceTradingResource" NOT NULL,

    CONSTRAINT "BalanceTradingLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminTrading" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AdminTradingRole" NOT NULL,

    CONSTRAINT "AdminTrading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterRally" (
    "id" TEXT NOT NULL,
    "current_periode" INTEGER NOT NULL,
    "special_ticket_stock" INTEGER NOT NULL,

    CONSTRAINT "MasterRally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZoneRally" (
    "id" TEXT NOT NULL,
    "zone" "Zone" NOT NULL,

    CONSTRAINT "ZoneRally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeriodeRally" (
    "id" TEXT NOT NULL,
    "periode" INTEGER NOT NULL,
    "eonix_addition" INTEGER NOT NULL,

    CONSTRAINT "PeriodeRally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeCostRally" (
    "id" TEXT NOT NULL,
    "zoneRally_id" TEXT NOT NULL,
    "periodeRally_id" TEXT NOT NULL,
    "eonix_amount" INTEGER NOT NULL,

    CONSTRAINT "ExchangeCostRally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRally" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "AdminRallyRole" NOT NULL,

    CONSTRAINT "AdminRally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallyData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "point" INTEGER NOT NULL,
    "minusPoint" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "eonix" INTEGER NOT NULL,
    "vault" INTEGER NOT NULL,
    "ticket" INTEGER NOT NULL,
    "specialTicket" INTEGER NOT NULL,

    CONSTRAINT "RallyData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BalanceRallyLog" (
    "id" TEXT NOT NULL,
    "rallyDataId" TEXT NOT NULL,
    "amount" DECIMAL(18,2) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "BalanceLogType" NOT NULL,
    "resource" "BalanceRallyResource" NOT NULL,

    CONSTRAINT "BalanceRallyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmallItemModel" (
    "id" TEXT NOT NULL,
    "rallyDataId" TEXT NOT NULL,
    "name" "SmallItem" NOT NULL,

    CONSTRAINT "SmallItemModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BigItemModel" (
    "id" TEXT NOT NULL,
    "rallyDataId" TEXT NOT NULL,
    "name" "BigItem" NOT NULL,

    CONSTRAINT "BigItemModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TradingData_userId_key" ON "TradingData"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminTrading_userId_key" ON "AdminTrading"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRally_userId_key" ON "AdminRally"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RallyData_userId_key" ON "RallyData"("userId");

-- AddForeignKey
ALTER TABLE "TradingData" ADD CONSTRAINT "TradingData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawItem" ADD CONSTRAINT "RawItem_tradingDataId_fkey" FOREIGN KEY ("tradingDataId") REFERENCES "TradingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CraftItem" ADD CONSTRAINT "CraftItem_tradingDataId_fkey" FOREIGN KEY ("tradingDataId") REFERENCES "TradingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceTradingLog" ADD CONSTRAINT "BalanceTradingLog_tradingDataId_fkey" FOREIGN KEY ("tradingDataId") REFERENCES "TradingData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminTrading" ADD CONSTRAINT "AdminTrading_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeCostRally" ADD CONSTRAINT "ExchangeCostRally_zoneRally_id_fkey" FOREIGN KEY ("zoneRally_id") REFERENCES "ZoneRally"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeCostRally" ADD CONSTRAINT "ExchangeCostRally_periodeRally_id_fkey" FOREIGN KEY ("periodeRally_id") REFERENCES "PeriodeRally"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRally" ADD CONSTRAINT "AdminRally_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyData" ADD CONSTRAINT "RallyData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceRallyLog" ADD CONSTRAINT "BalanceRallyLog_rallyDataId_fkey" FOREIGN KEY ("rallyDataId") REFERENCES "RallyData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmallItemModel" ADD CONSTRAINT "SmallItemModel_rallyDataId_fkey" FOREIGN KEY ("rallyDataId") REFERENCES "RallyData"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BigItemModel" ADD CONSTRAINT "BigItemModel_rallyDataId_fkey" FOREIGN KEY ("rallyDataId") REFERENCES "RallyData"("id") ON DELETE CASCADE ON UPDATE CASCADE;
