import { prisma } from "@/lib/prisma";
import { AddFoodForm } from "./AddFoodForm";
import { FoodsList } from "./FoodsList";

export const dynamic = "force-dynamic";

export default async function FoodsPage() {
  const foods = await prisma.food.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Foods</h1>
      <p className="mb-5 text-sm text-ink-muted">Your personal nutrition database, per 100g.</p>

      <AddFoodForm />

      {foods.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No foods yet — add your first one above.
        </p>
      ) : (
        <FoodsList foods={foods} />
      )}
    </div>
  );
}
