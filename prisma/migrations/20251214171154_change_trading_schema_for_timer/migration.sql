-- AlterTable
ALTER TABLE "PeriodeTrading" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "pausedTime" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3),
ADD COLUMN     "status" "RallyPeriodStatus" NOT NULL DEFAULT 'NOT_STARTED',
ADD COLUMN     "totalPausedDuration" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "MasterTrading" ADD CONSTRAINT "MasterTrading_current_periode_fkey" FOREIGN KEY ("current_periode") REFERENCES "PeriodeTrading"("periode") ON DELETE CASCADE ON UPDATE CASCADE;
