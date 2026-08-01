"use client";

import { useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");

  const filteredTemplates = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query === ""
      ? templates
      : templates.filter((t) => t.name.toLowerCase().includes(query));
  }, [templates, search]);

  return (
    <>
      <AddDayTemplateForm foods={foods} recipes={recipes} />

      {templates.length > 0 && (
        <div className="mb-3 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
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

      {templates.length === 0 ? (
        <p className="text-sm text-ink-muted">No day templates yet — add your first one above.</p>
      ) : filteredTemplates.length === 0 ? (
        <p className="text-sm text-ink-muted">No templates match your search.</p>
      ) : (
        filteredTemplates.map((template) => (
          <DayTemplateCard key={template.id} template={template} foods={foods} recipes={recipes} />
        ))
      )}
    </>
  );
}
