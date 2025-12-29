/*
  Warnings:

  - You are about to drop the column `testId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `lang` on the `PendingCode` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `PendingCode` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `PendingCode` table. All the data in the column will be lost.
  - Made the column `authorId` on table `Course` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_authorId_fkey";

-- AlterTable
ALTER TABLE "Course" ALTER COLUMN "authorId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "testId";

-- AlterTable
ALTER TABLE "PendingCode" DROP COLUMN "lang",
DROP COLUMN "name",
DROP COLUMN "password";

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
