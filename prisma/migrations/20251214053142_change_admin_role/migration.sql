/*
  Warnings:

  - You are about to drop the `AdminRally` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AdminTrading` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PARTICIPANT', 'SUPER', 'TALKSHOW', 'SELL', 'BUYRAW', 'CRAFT', 'MAP', 'BLACKMARKET', 'PITCHINGGUARD', 'PITCHING', 'CURRENCY', 'THUNT', 'EXCHANGE', 'UPGRADE', 'POSTGUARD', 'MONSTER');

-- DropForeignKey
ALTER TABLE "AdminRally" DROP CONSTRAINT "AdminRally_userId_fkey";

-- DropForeignKey
ALTER TABLE "AdminTrading" DROP CONSTRAINT "AdminTrading_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'PARTICIPANT';

-- DropTable
DROP TABLE "AdminRally";

-- DropTable
DROP TABLE "AdminTrading";

-- DropEnum
DROP TYPE "AdminRallyRole";

-- DropEnum
DROP TYPE "AdminTradingRole";
