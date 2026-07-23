import type { FoodCategory } from "@/generated/prisma/enums";

export const FOOD_CATEGORIES: FoodCategory[] = [
  "PROTEIN",
  "CARBS",
  "LEGUME",
  "DAIRY",
  "FRUIT",
  "VEGETABLE",
  "FAT_OIL",
  "SWEETS",
  "SNACK",
  "OTHER",
];

export const FOOD_CATEGORY_LABELS: Record<FoodCategory, string> = {
  PROTEIN: "Protein",
  CARBS: "Carbs",
  LEGUME: "Legume",
  DAIRY: "Dairy",
  FRUIT: "Fruit",
  VEGETABLE: "Vegetable",
  FAT_OIL: "Fat / Oil",
  SWEETS: "Sweets",
  SNACK: "Snack",
  OTHER: "Other",
};
