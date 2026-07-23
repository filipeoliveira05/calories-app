"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { FOOD_CATEGORIES } from "@/lib/foodCategories";
import type { FoodCategory } from "@/generated/prisma/enums";

function parseFoodForm(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const caloriesPer100g = Number(formData.get("caloriesPer100g"));
  const proteinPer100g = Number(formData.get("proteinPer100g"));
  const category = String(formData.get("category") ?? "") as FoodCategory;

  if (!name) throw new Error("Name is required");
  if (!Number.isFinite(caloriesPer100g) || caloriesPer100g < 0)
    throw new Error("Calories must be a non-negative number");
  if (!Number.isFinite(proteinPer100g) || proteinPer100g < 0)
    throw new Error("Protein must be a non-negative number");
  if (!FOOD_CATEGORIES.includes(category))
    throw new Error("Invalid category");

  return { name, caloriesPer100g, proteinPer100g, category };
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
