/*
  Warnings:

  - You are about to drop the column `category` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `difficulty` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `lessonsCount` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_courseId_fkey";

-- AlterTable
ALTER TABLE "Course" DROP COLUMN "category",
DROP COLUMN "difficulty",
DROP COLUMN "image",
DROP COLUMN "language",
DROP COLUMN "lessonsCount",
DROP COLUMN "publishedAt",
DROP COLUMN "shortDescription",
DROP COLUMN "status",
ADD COLUMN     "keywords" TEXT[],
ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Lesson" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Document";

-- DropTable
DROP TABLE "Video";
