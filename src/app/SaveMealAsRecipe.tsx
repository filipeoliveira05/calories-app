"use client";

import { useState, useTransition } from "react";
import { saveMealAsRecipe } from "./actions";
import type { MealType } from "@/generated/prisma/enums";

export function SaveMealAsRecipe({ mealType, date }: { mealType: MealType; date: string }) {
  const [savingAs, setSavingAs] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [matchedRecipeName, setMatchedRecipeName] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function save(force = false) {
    if (!name.trim()) return;
    setError(null);
    setMatchedRecipeName(null);
    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("mealType", mealType);
    formData.set("date", date);
    if (force) formData.set("force", "true");
    startTransition(async () => {
      try {
        await saveMealAsRecipe(formData);
        setSavingAs(false);
        setName("");
        setSaved(true);
      } catch (e) {
        const message = e instanceof Error ? e.message : "Failed to save recipe";
        const duplicate = message.match(/^DUPLICATE_CONTENT::(.+)$/);
        if (duplicate) {
          setMatchedRecipeName(duplicate[1]);
        } else {
          setError(message);
        }
      }
    });
  }

  return (
    <div className={`flex flex-wrap items-center gap-1.5 text-xs ${savingAs ? "w-full" : ""}`}>
      {savingAs ? (
        <>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Recipe name"
            className="min-w-0 flex-1 rounded-lg border border-hairline bg-bg px-2 py-1 text-xs text-ink focus:border-sage focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              setSavingAs(false);
              setName("");
              setMatchedRecipeName(null);
            }}
            className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => save()}
            disabled={!name.trim() || isPending}
            className="rounded-lg bg-sage px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
        </>
      ) : saved ? (
        <span className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-sage">
          ✓ Saved as a recipe
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setSavingAs(true)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-sage hover:bg-sage-soft"
        >
          Save as recipe
        </button>
      )}
      {error && (
        <span className="flex w-full items-start gap-1.5 text-danger">
          <span className="whitespace-pre-line">{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss"
            className="shrink-0 font-medium text-danger hover:opacity-70"
          >
            ×
          </button>
        </span>
      )}
      {matchedRecipeName && (
        <span className="flex w-full flex-wrap items-center gap-1.5 text-danger">
          <span>Matches existing recipe &quot;{matchedRecipeName}&quot;.</span>
          <button
            type="button"
            onClick={() => {
              setSavingAs(false);
              setName("");
              setMatchedRecipeName(null);
            }}
            className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={isPending}
            className="rounded-lg bg-sage px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
          >
            Save anyway
          </button>
        </span>
      )}
    </div>
  );
}
