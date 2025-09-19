-- AlterTable
ALTER TABLE "public"."ScrapeJob" ADD COLUMN     "error_log" TEXT,
ADD COLUMN     "finished_at" TIMESTAMP(3),
ADD COLUMN     "started_at" TIMESTAMP(3);
