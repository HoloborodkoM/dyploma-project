/*
  Warnings:

  - You are about to drop the column `description` on the `Lesson` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Simulation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Simulation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lesson" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Simulation" ADD COLUMN     "slug" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Simulation_slug_key" ON "Simulation"("slug");
