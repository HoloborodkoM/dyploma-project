/*
  Warnings:

  - You are about to drop the column `isPublished` on the `Simulation` table. All the data in the column will be lost.
  - You are about to drop the `ModelAsset` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StepModel` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `videoUrl` to the `Step` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ModelAsset" DROP CONSTRAINT "ModelAsset_simulationId_fkey";

-- DropForeignKey
ALTER TABLE "StepModel" DROP CONSTRAINT "StepModel_modelId_fkey";

-- DropForeignKey
ALTER TABLE "StepModel" DROP CONSTRAINT "StepModel_stepId_fkey";

-- AlterTable
ALTER TABLE "Simulation" DROP COLUMN "isPublished";

-- AlterTable
ALTER TABLE "Step" ADD COLUMN     "videoUrl" TEXT NOT NULL;

-- DropTable
DROP TABLE "ModelAsset";

-- DropTable
DROP TABLE "StepModel";
