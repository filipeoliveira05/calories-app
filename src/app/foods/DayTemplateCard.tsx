"use client";

import { useState, useTransition } from "react";
import { updateDayTemplate, deleteDayTemplate } from "./actions";
import {
  DayTemplateEntryEditor,
  entryTotals,
  type DayTemplateDraftEntry,
} from "./DayTemplateEntryEditor";
import type { Food } from "./IngredientRows";
import type { Recipe } from "./RecipeCard";
import { MEAL_TYPES, MEAL_TYPE_LABELS } from "@/lib/mealTypes";
import type { MealType } from "@/generated/prisma/enums";

export type DayTemplateEntry = {
  id: string;
  mealType: MealType;
  foodId: string;
  foodName: string;
  grams: number | null;
  quantity: number | null;
  unitLabel: string | null;
};

export type DayTemplate = {
  id: string;
  name: string;
  entries: DayTemplateEntry[];
};

const inputClasses =
  "w-full rounded-xl border border-hairline bg-bg px-2.5 py-2 text-sm text-ink focus:border-sage focus:outline-none";

export function DayTemplateCard({
  template,
  foods,
  recipes,
}: {
  template: DayTemplate;
  foods: Food[];
  recipes: Recipe[];
}) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [entries, setEntries] = useState<DayTemplateDraftEntry[]>(() =>
    template.entries.map((te) => ({
      key: te.id,
      mealType: te.mealType,
      foodId: te.foodId,
      amount: String(te.grams ?? te.quantity ?? ""),
    })),
  );

  const foodMap = new Map(foods.map((f) => [f.id, f]));
  const displayTotals = entryTotals(
    foods,
    template.entries.map((te) => ({
      foodId: te.foodId,
      amount: String(te.grams ?? te.quantity ?? ""),
    })),
  );

  const groupedEntries = MEAL_TYPES.map((mt) => {
    const mtEntries = template.entries.filter((te) => te.mealType === mt);
    return {
      mealType: mt,
      entries: mtEntries,
      totals: entryTotals(
        foods,
        mtEntries.map((te) => ({ foodId: te.foodId, amount: String(te.grams ?? te.quantity ?? "") })),
      ),
    };
  }).filter((g) => g.entries.length > 0);

  if (editing) {
    return (
      <form
        action={(formData) => {
          setError(null);
          startTransition(async () => {
            try {
              await updateDayTemplate(template.id, formData);
              setEditing(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to update template");
            }
          });
        }}
        className="mb-3 flex flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-sm"
      >
        <input name="name" defaultValue={template.name} required className={inputClasses} />
        <DayTemplateEntryEditor foods={foods} recipes={recipes} entries={entries} onChange={setEntries} />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isPending || entries.length === 0}
            className="ml-auto rounded-lg bg-sage px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-muted"
          >
            Cancel
          </button>
        </div>
        {error && (
          <p className="flex items-start gap-1.5 text-xs text-danger">
            <span className="whitespace-pre-line">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              aria-label="Dismiss"
              className="shrink-0 font-medium text-danger hover:opacity-70"
            >
              ×
            </button>
          </p>
        )}
      </form>
    );
  }

  return (
    <div className="mb-3 rounded-2xl bg-surface-raised p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium">{template.name}</p>
          <div className="mt-1 flex flex-col gap-1.5">
            {groupedEntries.map(({ mealType, entries: mtEntries, totals }) => (
              <div key={mealType}>
                <span className="w-fit rounded-full bg-sage-soft px-2 py-0.5 text-[0.65rem] font-medium text-sage">
                  {MEAL_TYPE_LABELS[mealType]}
                </span>
                <ul className="mt-1 flex flex-col gap-0.5 text-xs text-ink-muted">
                  {mtEntries.map((te) => {
                    const food = foodMap.get(te.foodId);
                    const amount = food?.isLoggedByUnit
                      ? `${te.quantity} ${food.unitLabel ?? "unit"}`
                      : `${te.grams}g`;
                    return (
                      <li key={te.id} className="truncate">
                        º {te.foodName} <span className="tabular-nums"> - {amount}</span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-0.5 text-xs text-ink-muted">
                  → {totals.calories.toFixed(0)} kcal, {totals.protein.toFixed(1)} g protein
                </p>
              </div>
            ))}
          </div>
          <p className="mt-1.5 text-sm text-ink-muted">
            → {displayTotals.calories.toFixed(0)} kcal, {displayTotals.protein.toFixed(1)} g protein
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted hover:bg-surface"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${template.name}"?`)) {
                startTransition(() => deleteDayTemplate(template.id));
              }
            }}
            disabled={isPending}
            className="rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-terracotta-soft disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
