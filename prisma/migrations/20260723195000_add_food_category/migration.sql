-- CreateEnum
CREATE TYPE "FoodCategory" AS ENUM ('PROTEIN', 'CARBS', 'LEGUME', 'DAIRY', 'FRUIT', 'VEGETABLE', 'FAT_OIL', 'SWEETS', 'SNACK', 'OTHER');

-- AlterTable
ALTER TABLE "Food" ADD COLUMN     "category" "FoodCategory" NOT NULL DEFAULT 'OTHER';
