import { prisma } from "@/lib/prisma";
import { AddFoodForm } from "./AddFoodForm";
import { FoodRow } from "./FoodRow";

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
        <div className="rounded-2xl bg-surface-raised p-3 shadow-sm">
          <div className="grid grid-cols-[1fr_4.5rem_4.5rem_auto] gap-2 border-b border-hairline pb-2 text-xs font-medium text-ink-muted">
            <span className="min-w-0 truncate">Name</span>
            <span>Calories</span>
            <span>Protein</span>
            <div className="invisible flex gap-1" aria-hidden>
              <button className="rounded-lg px-2 py-1 text-xs font-medium">Edit</button>
              <button className="rounded-lg px-2 py-1 text-xs font-medium">Delete</button>
            </div>
          </div>
          {foods.map((food) => (
            <FoodRow key={food.id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
}
