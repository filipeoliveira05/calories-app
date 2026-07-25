"use client";

import { useState } from "react";
import { AddFoodForm } from "./AddFoodForm";
import { FoodsList } from "./FoodsList";
import { RecipesList } from "./RecipesList";
import { DayTemplatesList } from "./DayTemplatesList";
import type { Food } from "./IngredientRows";
import type { Recipe } from "./RecipeCard";
import type { DayTemplate } from "./DayTemplateCard";

export function FoodsPageTabs({
  foods,
  recipes,
  templates,
}: {
  foods: Food[];
  recipes: Recipe[];
  templates: DayTemplate[];
}) {
  const [tab, setTab] = useState<"foods" | "recipes" | "templates">("foods");

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
        <button
          onClick={() => setTab("templates")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tab === "templates" ? "bg-sage text-white" : "bg-surface-raised text-ink-muted"
          }`}
        >
          Templates
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
      ) : tab === "recipes" ? (
        <RecipesList recipes={recipes} foods={foods} />
      ) : (
        <DayTemplatesList templates={templates} foods={foods} recipes={recipes} />
      )}
    </>
  );
}
