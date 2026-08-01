"use client";

import { useState } from "react";
import { AddFoodForm } from "./AddFoodForm";
import { FoodsList } from "./FoodsList";
import { RecipesList } from "./RecipesList";
import { DayTemplatesList } from "./DayTemplatesList";
import { ArchivedFoodsList, type ArchivedFood } from "./ArchivedFoodsList";
import type { Food } from "./IngredientRows";
import type { Recipe } from "./RecipeCard";
import type { DayTemplate } from "./DayTemplateCard";

export function FoodsPageTabs({
  foods,
  recipes,
  templates,
  archivedFoods,
}: {
  foods: Food[];
  recipes: Recipe[];
  templates: DayTemplate[];
  archivedFoods: ArchivedFood[];
}) {
  const [tab, setTab] = useState<"foods" | "recipes" | "templates" | "history">("foods");

  const subtitle = {
    foods: "Your personal nutrition database, per 100g.",
    recipes: "Group foods commonly eaten together under one name.",
    templates: "Save a full day's eating pattern to apply in one action.",
    history: "Foods you've logged in the past that have since been deleted.",
  }[tab];

  return (
    <>
      <p className="mb-5 text-sm text-ink-muted">{subtitle}</p>

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
        <button
          onClick={() => setTab("history")}
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            tab === "history" ? "bg-sage text-white" : "bg-surface-raised text-ink-muted"
          }`}
        >
          History
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
      ) : tab === "templates" ? (
        <DayTemplatesList templates={templates} foods={foods} recipes={recipes} />
      ) : (
        <ArchivedFoodsList archivedFoods={archivedFoods} />
      )}
    </>
  );
}
