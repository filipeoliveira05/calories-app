import type { ActivityLevel, Sex, WeightGoalType } from "@/generated/prisma/enums";

export const ACTIVITY_LEVELS: ActivityLevel[] = [
  "SEDENTARY",
  "LIGHT",
  "MODERATE",
  "ACTIVE",
  "VERY_ACTIVE",
];

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  SEDENTARY: "Sedentary (little/no exercise)",
  LIGHT: "Light (exercise 1-3 days/week)",
  MODERATE: "Moderate (exercise 3-5 days/week)",
  ACTIVE: "Active (hard exercise 6-7 days/week)",
  VERY_ACTIVE: "Very active (very hard exercise or physical job)",
};

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHT: 1.375,
  MODERATE: 1.55,
  ACTIVE: 1.725,
  VERY_ACTIVE: 1.9,
};

export const WEIGHT_GOAL_TYPES: WeightGoalType[] = ["LOSE", "MAINTAIN", "GAIN"];

export const WEIGHT_GOAL_TYPE_LABELS: Record<WeightGoalType, string> = {
  LOSE: "Lose weight",
  MAINTAIN: "Maintain weight",
  GAIN: "Gain weight",
};

// kcal per kg of body weight, used to convert a weekly rate of change into a daily calorie offset.
const KCAL_PER_KG = 7700;

function ageInYears(birthDate: Date, now: Date): number {
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const hasHadBirthdayThisYear =
    now.getUTCMonth() > birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() &&
      now.getUTCDate() >= birthDate.getUTCDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

export interface CalculateGoalsInput {
  sex: Sex;
  birthDate: Date;
  heightCm: number;
  activityLevel: ActivityLevel;
  goalType: WeightGoalType;
  goalRateKgPerWeek: number;
  proteinPerKg: number;
  weightKg: number;
}

export interface CalculatedGoals {
  maintenanceCalories: number;
  calorieGoal: number;
  proteinGoal: number;
}

export function calculateGoals(
  input: CalculateGoalsInput,
  now: Date = new Date(),
): CalculatedGoals {
  const age = ageInYears(input.birthDate, now);
  const bmr =
    10 * input.weightKg +
    6.25 * input.heightCm -
    5 * age +
    (input.sex === "MALE" ? 5 : -161);

  const maintenanceCalories = bmr * ACTIVITY_MULTIPLIERS[input.activityLevel];

  const direction =
    input.goalType === "LOSE" ? -1 : input.goalType === "GAIN" ? 1 : 0;
  const dailyOffset = (direction * input.goalRateKgPerWeek * KCAL_PER_KG) / 7;

  return {
    maintenanceCalories,
    calorieGoal: maintenanceCalories + dailyOffset,
    proteinGoal: input.proteinPerKg * input.weightKg,
  };
}
