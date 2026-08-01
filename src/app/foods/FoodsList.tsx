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

type SortKey = "name" | "category" | "calories" | "protein";
type SortState = { key: SortKey; dir: "asc" | "desc" } | null;

function initialSortDir(key: SortKey): "asc" | "desc" {
  return key === "calories" || key === "protein" ? "desc" : "asc";
}

function compareBy(key: SortKey, a: Food, b: Food): number {
  switch (key) {
    case "name":
      return a.name.localeCompare(b.name);
    case "category":
      return FOOD_CATEGORIES.indexOf(a.category) - FOOD_CATEGORIES.indexOf(b.category);
    case "calories":
      return a.caloriesPer100g - b.caloriesPer100g;
    case "protein":
      return a.proteinPer100g - b.proteinPer100g;
  }
}

export function FoodsList({ foods }: { foods: Food[] }) {
  const [filter, setFilter] = useState<FoodCategory | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>(null);

  function toggleSort(key: SortKey) {
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: initialSortDir(key) };
      const isDescFirst = key === "calories" || key === "protein";
      if (isDescFirst) {
        return prev.dir === "desc" ? { key, dir: "asc" } : null;
      }
      return prev.dir === "asc" ? { key, dir: "desc" } : null;
    });
  }

  const filteredFoods = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = foods.filter(
      (f) =>
        (filter === "ALL" || f.category === filter) &&
        (query === "" || f.name.toLowerCase().includes(query)),
    );
    if (!sort) return filtered;
    const sorted = filtered.slice().sort((a, b) => compareBy(sort.key, a, b));
    if (sort.dir === "desc") sorted.reverse();
    return sorted;
  }, [foods, filter, search, sort]);

  function sortIndicator(key: SortKey) {
    if (!sort || sort.key !== key) return null;
    return sort.dir === "asc" ? " ▲" : " ▼";
  }

  return (
    <>
      <div className="mb-3 relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search foods..."
          className="w-full rounded-xl border border-hairline bg-bg px-3 py-2 pr-8 text-sm"
        />
        {search !== "" && (
          <button
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted"
          >
            ×
          </button>
        )}
      </div>

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
            onClick={() => setFilter((prev) => (prev === category ? "ALL" : category))}
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
        <p className="text-sm text-ink-muted">
          {search !== "" ? "No foods match your search." : "No foods in this category."}
        </p>
      ) : (
        <div className="rounded-2xl bg-surface-raised p-3 shadow-sm">
          <div className="grid grid-cols-[1fr_6.5rem_4.5rem_4.5rem_auto] gap-2 border-b border-hairline pb-2 text-xs font-medium text-ink-muted">
            <button
              onClick={() => toggleSort("name")}
              className="min-w-0 truncate text-left"
            >
              Name{sortIndicator("name")}
            </button>
            <button onClick={() => toggleSort("category")} className="text-left">
              Category{sortIndicator("category")}
            </button>
            <button onClick={() => toggleSort("calories")} className="text-left">
              kcal/100g{sortIndicator("calories")}
            </button>
            <button onClick={() => toggleSort("protein")} className="text-left">
              Protein/100g{sortIndicator("protein")}
            </button>
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
