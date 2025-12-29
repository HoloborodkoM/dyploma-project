/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Simulation` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Simulation" DROP COLUMN "updatedAt",
ADD COLUMN     "editedAt" TIMESTAMP(3),
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;
