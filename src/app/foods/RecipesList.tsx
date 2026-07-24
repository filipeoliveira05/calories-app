"use client";

import { AddRecipeForm } from "./AddRecipeForm";
import { RecipeCard, type Recipe } from "./RecipeCard";
import type { Food } from "./IngredientRows";

export function RecipesList({ recipes, foods }: { recipes: Recipe[]; foods: Food[] }) {
  return (
    <>
      <AddRecipeForm foods={foods} />
      {recipes.length === 0 ? (
        <p className="text-sm text-ink-muted">No recipes yet — add your first one above.</p>
      ) : (
        recipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} foods={foods} />)
      )}
    </>
  );
}
