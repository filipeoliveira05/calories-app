-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "WeightGoalType" AS ENUM ('LOSE', 'MAINTAIN', 'GAIN');

-- AlterTable
ALTER TABLE "Goals" ADD COLUMN     "activityLevel" "ActivityLevel",
ADD COLUMN     "birthDate" DATE,
ADD COLUMN     "goalRateKgPerWeek" DOUBLE PRECISION,
ADD COLUMN     "goalType" "WeightGoalType",
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "proteinPerKg" DOUBLE PRECISION,
ADD COLUMN     "sex" "Sex",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
