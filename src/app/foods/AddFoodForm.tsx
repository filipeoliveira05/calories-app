"use client";

import { useRef, useState, useTransition } from "react";
import { createFood } from "./actions";
import { FoodFields, FoodUnitToggleFields } from "./FoodFields";

export function AddFoodForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isLoggedByUnit, setIsLoggedByUnit] = useState(false);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        setSuccess(null);
        startTransition(async () => {
          try {
            const name = formData.get("name");
            await createFood(formData);
            formRef.current?.reset();
            setIsLoggedByUnit(false);
            setSuccess(
              typeof name === "string" && name
                ? `"${name}" added`
                : "Food added"
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add food");
          }
        });
      }}
      className="mb-5 grid grid-cols-[1fr_6.5rem_4.5rem_4.5rem_auto] items-end gap-2 rounded-2xl bg-surface-raised p-4 shadow-sm"
    >
      <FoodFields isLoggedByUnit={isLoggedByUnit} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-xl bg-sage px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        Add
      </button>

      <FoodUnitToggleFields
        isLoggedByUnit={isLoggedByUnit}
        onIsLoggedByUnitChange={setIsLoggedByUnit}
        className="col-span-5 mt-1"
      />

      {error && (
        <span className="col-span-5 flex items-start gap-1.5 text-xs text-danger">
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

      {success && (
        <span className="col-span-5 flex items-start gap-1.5 text-xs text-sage">
          <span className="whitespace-pre-line">{success}</span>
          <button
            type="button"
            onClick={() => setSuccess(null)}
            aria-label="Dismiss"
            className="shrink-0 font-medium text-sage hover:opacity-70"
          >
            ×
          </button>
        </span>
      )}
    </form>
  );
}
