/*
  Warnings:

  - You are about to drop the column `description` on the `Step` table. All the data in the column will be lost.
  - You are about to drop the `LessonProgress` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `Step` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LessonProgress" DROP CONSTRAINT "LessonProgress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "LessonProgress" DROP CONSTRAINT "LessonProgress_userId_fkey";

-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Step" DROP COLUMN "description",
ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "LessonProgress";
