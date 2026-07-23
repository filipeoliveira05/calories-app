"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { MealType } from "@/generated/prisma/enums";

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function logMeal(formData: FormData) {
  const foodId = String(formData.get("foodId") ?? "");
  const mealType = String(formData.get("mealType") ?? "BREAKFAST") as MealType;

  if (!foodId) throw new Error("Pick a food");

  const food = await prisma.food.findUnique({ where: { id: foodId } });
  if (!food) throw new Error("Food not found");

  let grams: number;
  let quantity: number | null = null;

  if (food.isLoggedByUnit) {
    quantity = Number(formData.get("quantity"));
    if (!Number.isFinite(quantity) || quantity <= 0)
      throw new Error("Quantity must be a positive number");
    grams = quantity * food.gramsPerUnit!;
  } else {
    grams = Number(formData.get("grams"));
    if (!Number.isFinite(grams) || grams <= 0)
      throw new Error("Grams must be a positive number");
  }

  await prisma.mealEntry.create({
    data: {
      date: todayDateOnly(),
      mealType,
      grams,
      foodId: food.id,
      foodName: food.name,
      caloriesPer100g: food.caloriesPer100g,
      proteinPer100g: food.proteinPer100g,
      quantity,
      unitLabel: food.isLoggedByUnit ? food.unitLabel : null,
      gramsPerUnit: food.isLoggedByUnit ? food.gramsPerUnit : null,
    },
  });

  revalidatePath("/");
}

export async function deleteMealEntry(id: string) {
  await prisma.mealEntry.delete({ where: { id } });
  revalidatePath("/");
}

export async function updateMealEntryGrams(id: string, grams: number) {
  if (!Number.isFinite(grams) || grams <= 0)
    throw new Error("Grams must be a positive number");

  await prisma.mealEntry.update({ where: { id }, data: { grams } });
  revalidatePath("/");
}

export async function updateMealEntryQuantity(id: string, quantity: number) {
  if (!Number.isFinite(quantity) || quantity <= 0)
    throw new Error("Quantity must be a positive number");

  const entry = await prisma.mealEntry.findUnique({ where: { id } });
  if (!entry || entry.gramsPerUnit == null) throw new Error("Entry not found");

  await prisma.mealEntry.update({
    where: { id },
    data: { quantity, grams: quantity * entry.gramsPerUnit },
  });
  revalidatePath("/");
}
