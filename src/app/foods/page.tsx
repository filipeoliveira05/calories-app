import { prisma } from "@/lib/prisma";
import { FoodsPageTabs } from "./FoodsPageTabs";

export const dynamic = "force-dynamic";

export default async function FoodsPage() {
  const [foods, recipes] = await Promise.all([
    prisma.food.findMany({ orderBy: { name: "asc" } }),
    prisma.recipe.findMany({
      orderBy: { name: "asc" },
      include: { ingredients: { include: { food: true } } },
    }),
  ]);

  const recipesForUi = recipes.map((recipe) => ({
    id: recipe.id,
    name: recipe.name,
    ingredients: recipe.ingredients.map((ri) => ({
      id: ri.id,
      foodId: ri.foodId,
      foodName: ri.food.name,
      grams: ri.grams,
      quantity: ri.quantity,
      unitLabel: ri.food.unitLabel,
    })),
  }));

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Foods</h1>
      <p className="mb-5 text-sm text-ink-muted">Your personal nutrition database, per 100g.</p>

      <FoodsPageTabs foods={foods} recipes={recipesForUi} />
    </div>
  );
}
