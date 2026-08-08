-- AlterTable
ALTER TABLE "MealEntry" ADD COLUMN     "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill existing rows so current visual order (previously createdAt) is preserved.
UPDATE "MealEntry" AS m
SET "sortOrder" = sub.rn
FROM (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "date", "mealType" ORDER BY "createdAt") - 1 AS rn
  FROM "MealEntry"
) AS sub
WHERE m."id" = sub."id";
