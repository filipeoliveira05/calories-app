import { prisma } from "@/lib/prisma";
import { FoodsPageTabs } from "./FoodsPageTabs";

export const dynamic = "force-dynamic";

export default async function FoodsPage() {
  const [foods, recipes, templates, archivedEntries] = await Promise.all([
    prisma.food.findMany({ orderBy: { name: "asc" } }),
    prisma.recipe.findMany({
      orderBy: { name: "asc" },
      include: { ingredients: { include: { food: true } } },
    }),
    prisma.dayTemplate.findMany({
      orderBy: { name: "asc" },
      include: { entries: { include: { food: true } } },
    }),
    prisma.mealEntry.findMany({
      where: { foodId: null },
      select: {
        foodName: true,
        caloriesPer100g: true,
        proteinPer100g: true,
        unitLabel: true,
        gramsPerUnit: true,
        date: true,
      },
      orderBy: { date: "desc" },
    }),
  ]);

  // Group orphaned entries (food deleted, or never re-linked) by name, keeping
  // the most recent snapshot per name. Exclude any name that matches a food
  // that already exists — that's a live food, not a missing one.
  const currentFoodNames = new Set(foods.map((f) => f.name));
  const archivedByName = new Map<
    string,
    {
      name: string;
      caloriesPer100g: number;
      proteinPer100g: number;
      unitLabel: string | null;
      gramsPerUnit: number | null;
      lastLoggedAt: string;
      timesLogged: number;
    }
  >();
  for (const entry of archivedEntries) {
    if (currentFoodNames.has(entry.foodName)) continue;
    const existing = archivedByName.get(entry.foodName);
    if (existing) {
      existing.timesLogged += 1;
      continue;
    }
    archivedByName.set(entry.foodName, {
      name: entry.foodName,
      caloriesPer100g: entry.caloriesPer100g,
      proteinPer100g: entry.proteinPer100g,
      unitLabel: entry.unitLabel,
      gramsPerUnit: entry.gramsPerUnit,
      lastLoggedAt: entry.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
      timesLogged: 1,
    });
  }
  const archivedFoods = [...archivedByName.values()].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const recipesForUi = recipes.map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    mealTypes: recipe.mealTypes,
    ingredients: recipe.ingredients.map((ri) => ({
      id: ri.id,
      foodId: ri.foodId,
      foodName: ri.food.name,
      grams: ri.grams,
      quantity: ri.quantity,
      unitLabel: ri.food.unitLabel,
    })),
  }));

  const templatesForUi = templates.map((template) => ({
    id: template.id,
    name: template.name,
    entries: template.entries.map((te) => ({
      id: te.id,
      mealType: te.mealType,
      foodId: te.foodId,
      foodName: te.food.name,
      grams: te.grams,
      quantity: te.quantity,
      unitLabel: te.food.unitLabel,
    })),
  }));

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Foods</h1>

      <FoodsPageTabs
        foods={foods}
        recipes={recipesForUi}
        templates={templatesForUi}
        archivedFoods={archivedFoods}
      />
    </div>
  );
}
