/*
  Warnings:

  - You are about to drop the `MeetingValidation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ModelAccuracyMetric` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MeetingValidation" DROP CONSTRAINT "MeetingValidation_meetingId_fkey";

-- DropTable
DROP TABLE "MeetingValidation";

-- DropTable
DROP TABLE "ModelAccuracyMetric";
