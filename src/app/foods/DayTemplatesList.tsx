"use client";

import { AddDayTemplateForm } from "./AddDayTemplateForm";
import { DayTemplateCard, type DayTemplate } from "./DayTemplateCard";
import type { Food } from "./IngredientRows";
import type { Recipe } from "./RecipeCard";

export function DayTemplatesList({
  templates,
  foods,
  recipes,
}: {
  templates: DayTemplate[];
  foods: Food[];
  recipes: Recipe[];
}) {
  return (
    <>
      <AddDayTemplateForm foods={foods} recipes={recipes} />
      {templates.length === 0 ? (
        <p className="text-sm text-ink-muted">No day templates yet — add your first one above.</p>
      ) : (
        templates.map((template) => (
          <DayTemplateCard key={template.id} template={template} foods={foods} recipes={recipes} />
        ))
      )}
    </>
  );
}
