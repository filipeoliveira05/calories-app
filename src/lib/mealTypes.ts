import type { MealType } from "@/generated/prisma/enums";

export const MEAL_TYPES: MealType[] = [
  "BREAKFAST",
  "MORNING_SNACK",
  "LUNCH",
  "AFTERNOON_SNACK",
  "DINNER",
];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Breakfast",
  MORNING_SNACK: "Morning Snack",
  LUNCH: "Lunch",
  AFTERNOON_SNACK: "Afternoon Snack",
  DINNER: "Dinner",
};
