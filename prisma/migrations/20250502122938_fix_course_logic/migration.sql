/*
  Warnings:

  - The values [NOT_STARTED] on the enum `CourseStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `startedAt` on table `UserCourseProgress` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "CourseStatus_new" AS ENUM ('IN_PROGRESS', 'COMPLETED');
ALTER TABLE "UserCourseProgress" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "UserCourseProgress" ALTER COLUMN "status" TYPE "CourseStatus_new" USING ("status"::text::"CourseStatus_new");
ALTER TYPE "CourseStatus" RENAME TO "CourseStatus_old";
ALTER TYPE "CourseStatus_new" RENAME TO "CourseStatus";
DROP TYPE "CourseStatus_old";
ALTER TABLE "UserCourseProgress" ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- AlterTable
ALTER TABLE "UserCourseProgress" ALTER COLUMN "startedAt" SET NOT NULL,
ALTER COLUMN "startedAt" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "status" SET DEFAULT 'IN_PROGRESS';
