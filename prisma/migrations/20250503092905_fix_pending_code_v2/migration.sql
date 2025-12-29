/*
  Warnings:

  - Added the required column `name` to the `PendingCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `PendingCode` table without a default value. This is not possible if the table is not empty.

*/

-- Сначала добавляем колонки с возможностью NULL
ALTER TABLE "PendingCode" ADD COLUMN "name" TEXT;
ALTER TABLE "PendingCode" ADD COLUMN "password" TEXT;

-- Заполняем существующие записи временными значениями
UPDATE "PendingCode" SET "name" = 'Temporary User', "password" = 'temporary_value_to_be_changed';

-- Теперь делаем колонки NOT NULL
ALTER TABLE "PendingCode" ALTER COLUMN "name" SET NOT NULL;
ALTER TABLE "PendingCode" ALTER COLUMN "password" SET NOT NULL;
