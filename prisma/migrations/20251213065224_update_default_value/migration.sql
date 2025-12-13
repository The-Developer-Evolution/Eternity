-- AlterTable
ALTER TABLE "MasterRally" ALTER COLUMN "current_periode" SET DEFAULT 1,
ALTER COLUMN "special_ticket_stock" SET DEFAULT 5;

-- AlterTable
ALTER TABLE "MasterTrading" ALTER COLUMN "current_periode" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "RallyData" ALTER COLUMN "point" SET DEFAULT 0,
ALTER COLUMN "minusPoint" SET DEFAULT 0,
ALTER COLUMN "level" SET DEFAULT 0,
ALTER COLUMN "eonix" SET DEFAULT 0,
ALTER COLUMN "vault" SET DEFAULT 0,
ALTER COLUMN "ticket" SET DEFAULT 0,
ALTER COLUMN "specialTicket" SET DEFAULT 0;
