"use client";

import { useMemo, useState } from "react";
import { FoodRow } from "./FoodRow";
import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from "@/lib/foodCategories";
import type { FoodCategory } from "@/generated/prisma/enums";

type Food = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  category: FoodCategory;
  isLoggedByUnit: boolean;
  unitLabel: string | null;
  gramsPerUnit: number | null;
};

export function FoodsList({ foods }: { foods: Food[] }) {
  const [filter, setFilter] = useState<FoodCategory | "ALL">("ALL");

  const filteredFoods = useMemo(
    () => (filter === "ALL" ? foods : foods.filter((f) => f.category === filter)),
    [foods, filter],
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter("ALL")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            filter === "ALL"
              ? "bg-sage text-white"
              : "bg-surface-raised text-ink-muted"
          }`}
        >
          All
        </button>
        {FOOD_CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setFilter(category)}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === category
                ? "bg-sage text-white"
                : "bg-surface-raised text-ink-muted"
            }`}
          >
            {FOOD_CATEGORY_LABELS[category]}
          </button>
        ))}
      </div>

      {filteredFoods.length === 0 ? (
        <p className="text-sm text-ink-muted">No foods in this category.</p>
      ) : (
        <div className="rounded-2xl bg-surface-raised p-3 shadow-sm">
          <div className="grid grid-cols-[1fr_6.5rem_4.5rem_4.5rem_auto] gap-2 border-b border-hairline pb-2 text-xs font-medium text-ink-muted">
            <span className="min-w-0 truncate">Name</span>
            <span>Category</span>
            <span>kcal/100g</span>
            <span>Protein/100g</span>
            <div className="invisible flex gap-1" aria-hidden>
              <button className="rounded-lg px-2 py-1 text-xs font-medium">Edit</button>
              <button className="rounded-lg px-2 py-1 text-xs font-medium">Delete</button>
            </div>
          </div>
          {filteredFoods.map((food) => (
            <FoodRow key={food.id} food={food} />
          ))}
        </div>
      )}
    </>
  );
}
