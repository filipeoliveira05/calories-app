"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { dateOnlyFromParam } from "@/lib/dateOnly";
import { MEAL_TYPES } from "@/lib/mealTypes";
import type { MealType } from "@/generated/prisma/enums";

export async function logMeal(formData: FormData) {
  const foodId = String(formData.get("foodId") ?? "");
  const mealType = String(formData.get("mealType") ?? "BREAKFAST") as MealType;
  const date = dateOnlyFromParam(String(formData.get("date") ?? ""));

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
      date,
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

export async function logRecipe(formData: FormData) {
  const recipeId = String(formData.get("recipeId") ?? "");
  const mealType = String(formData.get("mealType") ?? "BREAKFAST") as MealType;
  if (!recipeId) throw new Error("Pick a recipe");

  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    include: { ingredients: { include: { food: true } } },
  });
  if (!recipe) throw new Error("Recipe not found");
  if (recipe.ingredients.length === 0) throw new Error("Recipe has no ingredients");

  const date = dateOnlyFromParam(String(formData.get("date") ?? ""));

  await prisma.$transaction(
    recipe.ingredients.map((ri) =>
      prisma.mealEntry.create({
        data: {
          date,
          mealType,
          grams: ri.food.isLoggedByUnit
            ? ri.quantity! * ri.food.gramsPerUnit!
            : ri.grams!,
          foodId: ri.food.id,
          foodName: ri.food.name,
          caloriesPer100g: ri.food.caloriesPer100g,
          proteinPer100g: ri.food.proteinPer100g,
          quantity: ri.food.isLoggedByUnit ? ri.quantity : null,
          unitLabel: ri.food.isLoggedByUnit ? ri.food.unitLabel : null,
          gramsPerUnit: ri.food.isLoggedByUnit ? ri.food.gramsPerUnit : null,
        },
      }),
    ),
  );

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

export async function applyDayTemplate(formData: FormData) {
  const templateId = String(formData.get("templateId") ?? "");
  if (!templateId) throw new Error("Pick a template");

  const template = await prisma.dayTemplate.findUnique({
    where: { id: templateId },
    include: { entries: { include: { food: true } } },
  });
  if (!template) throw new Error("Template not found");
  if (template.entries.length === 0) throw new Error("Template has no meals");

  const date = dateOnlyFromParam(String(formData.get("date") ?? ""));

  await prisma.$transaction(
    template.entries.map((te) =>
      prisma.mealEntry.create({
        data: {
          date,
          mealType: te.mealType,
          grams: te.food.isLoggedByUnit ? te.quantity! * te.food.gramsPerUnit! : te.grams!,
          foodId: te.food.id,
          foodName: te.food.name,
          caloriesPer100g: te.food.caloriesPer100g,
          proteinPer100g: te.food.proteinPer100g,
          quantity: te.food.isLoggedByUnit ? te.quantity : null,
          unitLabel: te.food.isLoggedByUnit ? te.food.unitLabel : null,
          gramsPerUnit: te.food.isLoggedByUnit ? te.food.gramsPerUnit : null,
        },
      }),
    ),
  );

  revalidatePath("/");
}

export async function saveDayAsTemplate(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const date = dateOnlyFromParam(String(formData.get("date") ?? ""));
  const entries = await prisma.mealEntry.findMany({ where: { date } });
  const withFood = entries.filter((e) => e.foodId != null);
  if (withFood.length === 0) throw new Error("No meals to save for this day");

  try {
    await prisma.dayTemplate.create({
      data: {
        name,
        entries: {
          create: withFood.map((e) => ({
            mealType: e.mealType,
            foodId: e.foodId!,
            grams: e.quantity == null ? e.grams : null,
            quantity: e.quantity,
          })),
        },
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

  revalidatePath("/");
}

type IngredientAmount = { foodId: string; grams: number | null; quantity: number | null };

/** Order-independent signature of a recipe's ingredients, for exact-content-match detection. */
function ingredientSignature(ingredients: IngredientAmount[]) {
  return ingredients
    .map((i) => `${i.foodId}:${i.grams?.toFixed(2) ?? ""}:${i.quantity?.toFixed(2) ?? ""}`)
    .sort()
    .join("|");
}

export async function saveMealAsRecipe(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required");

  const mealType = String(formData.get("mealType") ?? "") as MealType;
  if (!MEAL_TYPES.includes(mealType)) throw new Error("Invalid meal type");

  const date = dateOnlyFromParam(String(formData.get("date") ?? ""));
  const entries = await prisma.mealEntry.findMany({ where: { date, mealType } });
  const withFood = entries.filter((e) => e.foodId != null);
  if (withFood.length === 0) throw new Error("No foods to save from this meal");

  const force = formData.get("force") === "true";
  const ingredients = withFood.map((e) => ({
    foodId: e.foodId!,
    grams: e.quantity == null ? e.grams : null,
    quantity: e.quantity,
  }));

  if (!force) {
    const signature = ingredientSignature(ingredients);
    const existingRecipes = await prisma.recipe.findMany({
      select: { name: true, ingredients: { select: { foodId: true, grams: true, quantity: true } } },
    });
    const match = existingRecipes.find((r) => ingredientSignature(r.ingredients) === signature);
    if (match) throw new Error(`DUPLICATE_CONTENT::${match.name}`);
  }

  try {
    await prisma.recipe.create({
      data: {
        name,
        mealTypes: [mealType],
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

  revalidatePath("/");
}

export async function clearDay(formData: FormData) {
  const date = dateOnlyFromParam(String(formData.get("date") ?? ""));
  await prisma.mealEntry.deleteMany({ where: { date } });
  revalidatePath("/");
}
