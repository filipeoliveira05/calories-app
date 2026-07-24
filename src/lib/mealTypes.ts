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

/** Suggests a meal type from the time of day (e.g. for defaulting a log-entry form). */
export function getDefaultMealType(date: Date = new Date()): MealType {
  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes < 10 * 60) return "BREAKFAST";
  if (minutes < 12 * 60 + 30) return "MORNING_SNACK";
  if (minutes < 15 * 60 + 30) return "LUNCH";
  if (minutes < 19 * 60) return "AFTERNOON_SNACK";
  return "DINNER";
}
