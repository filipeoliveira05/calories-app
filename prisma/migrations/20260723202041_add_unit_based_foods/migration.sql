-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "gramsPerUnit" DOUBLE PRECISION,
ADD COLUMN     "isLoggedByUnit" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "unitLabel" TEXT;

-- AlterTable
ALTER TABLE "MealEntry" ADD COLUMN     "gramsPerUnit" DOUBLE PRECISION,
ADD COLUMN     "quantity" DOUBLE PRECISION,
ADD COLUMN     "unitLabel" TEXT;
