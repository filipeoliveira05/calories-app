-- AlterTable
ALTER TABLE "Recipe" ADD COLUMN     "mealTypes" "MealType"[] DEFAULT ARRAY[]::"MealType"[];
