import { prisma } from "@/lib/prisma";
import { AddFoodForm } from "./AddFoodForm";
import { FoodRow } from "./FoodRow";

export const dynamic = "force-dynamic";

export default async function FoodsPage() {
  const foods = await prisma.food.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Foods</h1>
      <AddFoodForm />

      {foods.length === 0 ? (
        <p className="text-sm text-zinc-500">
          No foods yet — add your first one above.
        </p>
      ) : (
        <div>
          <div className="grid grid-cols-[1fr_5rem_5rem_auto] gap-2 border-b border-black/10 pb-1 text-xs font-medium text-zinc-500 dark:border-white/10">
            <span>Name</span>
            <span>Calories</span>
            <span>Protein</span>
            <span />
          </div>
          {foods.map((food) => (
            <FoodRow key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
