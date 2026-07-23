"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FOOD_CATEGORIES } from "@/lib/foodCategories";
import type { FoodCategory } from "@/generated/prisma/enums";

function parseFoodForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  // Entered as per-100g normally, or per-unit when isLoggedByUnit (converted below).
  const calories = Number(formData.get("caloriesPer100g"));
  const protein = Number(formData.get("proteinPer100g"));
  const category = String(formData.get("category") ?? "") as FoodCategory;
  const isLoggedByUnit = formData.get("isLoggedByUnit") === "on";
  const unitLabel = String(formData.get("unitLabel") ?? "").trim();
  const gramsPerUnit = Number(formData.get("gramsPerUnit"));

  if (!name) throw new Error("Name is required");
  if (!Number.isFinite(calories) || calories < 0)
    throw new Error("Calories must be a non-negative number");
  if (!Number.isFinite(protein) || protein < 0)
    throw new Error("Protein must be a non-negative number");
  if (!FOOD_CATEGORIES.includes(category))
    throw new Error("Invalid category");
  if (isLoggedByUnit) {
    if (!unitLabel) throw new Error("Unit name is required");
    if (!Number.isFinite(gramsPerUnit) || gramsPerUnit <= 0)
      throw new Error("Grams per unit must be a positive number");
  }

  const caloriesPer100g = isLoggedByUnit ? (calories / gramsPerUnit) * 100 : calories;
  const proteinPer100g = isLoggedByUnit ? (protein / gramsPerUnit) * 100 : protein;

  return {
    name,
    caloriesPer100g,
    proteinPer100g,
    category,
    isLoggedByUnit,
    unitLabel: isLoggedByUnit ? unitLabel : null,
    gramsPerUnit: isLoggedByUnit ? gramsPerUnit : null,
  };
}

export async function createFood(formData: FormData) {
  const data = parseFoodForm(formData);
  try {
    await prisma.food.create({ data });
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      throw new Error(`"${data.name}" already exists`);
    }
    throw e;
  }
  revalidatePath("/foods");
}

export async function updateFood(id: string, formData: FormData) {
  const data = parseFoodForm(formData);
  await prisma.food.update({ where: { id }, data });
  revalidatePath("/foods");
}

export async function deleteFood(id: string) {
  await prisma.food.delete({ where: { id } });
  revalidatePath("/foods");
}
