-- AlterTable
ALTER TABLE "RallyMaster" ALTER COLUMN "current_period_id" DROP DEFAULT,
ALTER COLUMN "current_period_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "RallyMaster" ADD CONSTRAINT "RallyMaster_current_period_id_fkey" FOREIGN KEY ("current_period_id") REFERENCES "RallyPeriod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
