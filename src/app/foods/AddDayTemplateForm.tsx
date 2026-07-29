"use client";

import { useRef, useState, useTransition } from "react";
import { createDayTemplate } from "./actions";
import { DayTemplateEntryEditor, type DayTemplateDraftEntry } from "./DayTemplateEntryEditor";
import type { Food } from "./IngredientRows";
import type { Recipe } from "./RecipeCard";

const inputClasses =
  "w-full rounded-xl border border-hairline bg-bg px-2.5 py-2 text-sm text-ink focus:border-sage focus:outline-none";

export function AddDayTemplateForm({ foods, recipes }: { foods: Food[]; recipes: Recipe[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [entries, setEntries] = useState<DayTemplateDraftEntry[]>([]);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        setSuccess(null);
        startTransition(async () => {
          try {
            const name = formData.get("name");
            await createDayTemplate(formData);
            formRef.current?.reset();
            setEntries([]);
            setSuccess(
              typeof name === "string" && name ? `"${name}" added` : "Template added"
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add template");
          }
        });
      }}
      className="mb-5 flex flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <label className="text-xs text-ink-muted">Template name</label>
        <input name="name" placeholder="e.g. Standard Monday" required className={inputClasses} />
      </div>

      <DayTemplateEntryEditor foods={foods} recipes={recipes} entries={entries} onChange={setEntries} />

      <div className="flex items-center gap-3">
        {entries.length > 0 && (
          <button
            type="button"
            onClick={() => setEntries([])}
            className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink-muted"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isPending || entries.length === 0}
          className="ml-auto rounded-xl bg-sage px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save template
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

      {success && (
        <p className="flex items-start gap-1.5 text-xs text-sage">
          <span className="whitespace-pre-line">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            aria-label="Dismiss"
            className="shrink-0 font-medium text-sage hover:opacity-70"
          >
            ×
          </button>
        </p>
      )}
    </form>
  );
}
