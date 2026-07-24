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
  try {
    await prisma.food.delete({ where: { id } });
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2003"
    ) {
      const usedIn = await prisma.recipeIngredient.findMany({
        where: { foodId: id },
        include: { recipe: true },
        distinct: ["recipeId"],
      });
      const names = usedIn.map((ri) => `- ${ri.recipe.name}`).join("\n");
      throw new Error(
        `Used in recipe(s):\n${names}\nRemove it from those recipes first.`,
      );
    }
    throw e;
  }
  revalidatePath("/foods");
}

type IngredientInput = {
  foodId: string;
  grams: number | null;
  quantity: number | null;
};

function parseRecipeForm(formData: FormData, foods: Map<string, { isLoggedByUnit: boolean }>) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const foodIds = formData.getAll("ingredientFoodId").map(String);
  const amounts = formData.getAll("ingredientAmount").map(String);

  if (foodIds.length === 0) throw new Error("Add at least one ingredient");

  const ingredients: IngredientInput[] = foodIds.map((foodId, i) => {
    const food = foods.get(foodId);
    if (!food) throw new Error("Invalid ingredient food");
    const amount = Number(amounts[i]);
    if (!Number.isFinite(amount) || amount <= 0)
      throw new Error("Ingredient amount must be a positive number");
    return {
      foodId,
      grams: food.isLoggedByUnit ? null : amount,
      quantity: food.isLoggedByUnit ? amount : null,
    };
  });

  return { name, ingredients };
}

export async function createRecipe(formData: FormData) {
  const foods = await prisma.food.findMany({ select: { id: true, isLoggedByUnit: true } });
  const foodMap = new Map(foods.map((f) => [f.id, f]));
  const { name, ingredients } = parseRecipeForm(formData, foodMap);

  try {
    await prisma.recipe.create({
      data: {
        name,
        ingredients: { create: ingredients },
      },
    });
  } catch (e) {
    if (
      e &&
      typeof e === "object" &&
      "code" in e &&
      (e as { code: string }).code === "P2002"
    ) {
      throw new Error(`"${name}" already exists`);
    }
    throw e;
  }
  revalidatePath("/foods");
}

export async function updateRecipe(id: string, formData: FormData) {
  const foods = await prisma.food.findMany({ select: { id: true, isLoggedByUnit: true } });
  const foodMap = new Map(foods.map((f) => [f.id, f]));
  const { name, ingredients } = parseRecipeForm(formData, foodMap);

  await prisma.$transaction([
    prisma.recipeIngredient.deleteMany({ where: { recipeId: id } }),
    prisma.recipe.update({
      where: { id },
      data: {
        name,
        ingredients: { create: ingredients },
      },
    }),
  ]);
  revalidatePath("/foods");
}

export async function deleteRecipe(id: string) {
  await prisma.recipe.delete({ where: { id } });
  revalidatePath("/foods");
}
