-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
