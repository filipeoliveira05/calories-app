"use client";

import { useState } from "react";
import { AddFoodForm } from "./AddFoodForm";
import { FoodsList } from "./FoodsList";
import { RecipesList } from "./RecipesList";
import type { Food } from "./IngredientRows";
import type { Recipe } from "./RecipeCard";

export function FoodsPageTabs({ foods, recipes }: { foods: Food[]; recipes: Recipe[] }) {
  const [tab, setTab] = useState<"foods" | "recipes">("foods");

  return (
    <>
      <div className="mb-4 flex gap-1.5">
        <button
          onClick={() => setTab("foods")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tab === "foods" ? "bg-sage text-white" : "bg-surface-raised text-ink-muted"
          }`}
        >
          Foods
        </button>
        <button
          onClick={() => setTab("recipes")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tab === "recipes" ? "bg-sage text-white" : "bg-surface-raised text-ink-muted"
          }`}
        >
          Recipes
        </button>
      </div>

      {tab === "foods" ? (
        <>
          <AddFoodForm />
          {foods.length === 0 ? (
            <p className="text-sm text-ink-muted">No foods yet — add your first one above.</p>
          ) : (
            <FoodsList foods={foods} />
          )}
        </>
      ) : (
        <RecipesList recipes={recipes} foods={foods} />
      )}
    </>
  );
}
