"use client";

import { useMemo, useState } from "react";
import { AddRecipeForm } from "./AddRecipeForm";
import { RecipeCard, type Recipe } from "./RecipeCard";
import type { Food } from "./IngredientRows";
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "@/lib/mealTypes";
import type { MealType } from "@/generated/prisma/enums";

function sortKey(recipe: Recipe) {
  if (recipe.mealTypes.length === 0) return MEAL_TYPES.length;
  return Math.min(...recipe.mealTypes.map((mt) => MEAL_TYPES.indexOf(mt)));
}

export function RecipesList({ recipes, foods }: { recipes: Recipe[]; foods: Food[] }) {
  const [filter, setFilter] = useState<MealType | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filteredRecipes = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = recipes.filter(
      (r) =>
        (filter === "ALL" || r.mealTypes.includes(filter)) &&
        (query === "" || r.name.toLowerCase().includes(query)),
    );
    return filtered
      .slice()
      .sort((a, b) => sortKey(a) - sortKey(b) || a.name.localeCompare(b.name));
  }, [recipes, filter, search]);

  return (
    <>
      <AddRecipeForm foods={foods} />

      {recipes.length > 0 && (
        <div className="mb-3 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipes..."
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
      )}

      {recipes.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter("ALL")}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              filter === "ALL" ? "bg-sage text-white" : "bg-surface-raised text-ink-muted"
            }`}
          >
            All
          </button>
          {MEAL_TYPES.map((mealType) => (
            <button
              key={mealType}
              onClick={() => setFilter((prev) => (prev === mealType ? "ALL" : mealType))}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                filter === mealType ? "bg-sage text-white" : "bg-surface-raised text-ink-muted"
              }`}
            >
              {MEAL_TYPE_LABELS[mealType]}
            </button>
          ))}
        </div>
      )}

      {recipes.length === 0 ? (
        <p className="text-sm text-ink-muted">No recipes yet — add your first one above.</p>
      ) : filteredRecipes.length === 0 ? (
        <p className="text-sm text-ink-muted">
          {search !== "" ? "No recipes match your search." : "No recipes in this category."}
        </p>
      ) : (
        filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} foods={foods} />
        ))
      )}
    </>
  );
}
