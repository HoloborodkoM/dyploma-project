/*
  Warnings:

  - You are about to drop the column `questions` on the `Lesson` table. All the data in the column will be lost.
  - Made the column `documentUrl` on table `Lesson` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "questions",
ALTER COLUMN "documentUrl" SET NOT NULL;
