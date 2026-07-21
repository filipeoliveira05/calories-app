-- Replace MealType enum with the 5-meal ordering (Breakfast, Morning Snack,
-- Lunch, Afternoon Snack, Dinner), mapping existing SNACK rows to
-- MORNING_SNACK since the old single "Snack" bucket no longer exists.

CREATE TYPE "MealType_new" AS ENUM ('BREAKFAST', 'MORNING_SNACK', 'LUNCH', 'AFTERNOON_SNACK', 'DINNER');

ALTER TABLE "MealEntry" ALTER COLUMN "mealType" DROP DEFAULT;

ALTER TABLE "MealEntry"
  ALTER COLUMN "mealType" TYPE "MealType_new"
  USING (
    CASE "mealType"::text
      WHEN 'SNACK' THEN 'MORNING_SNACK'
      ELSE "mealType"::text
    END
  )::"MealType_new";

ALTER TABLE "MealEntry" ALTER COLUMN "mealType" SET DEFAULT 'BREAKFAST';

DROP TYPE "MealType";
ALTER TYPE "MealType_new" RENAME TO "MealType";
