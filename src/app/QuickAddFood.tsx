"use client";

import { useRef, useState, useTransition } from "react";
import { createFood } from "./foods/actions";
import { FoodFields, FoodUnitToggleFields } from "./foods/FoodFields";
import type { FoodCategory } from "@/generated/prisma/enums";

type CreatedFood = {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  category: FoodCategory;
  isLoggedByUnit: boolean;
  unitLabel: string | null;
  gramsPerUnit: number | null;
};

/** Builds FormData from named fields within a container, since this can't be a real <form> (it's nested inside LogMealForm's form). */
function collectFormData(container: HTMLElement) {
  const formData = new FormData();
  container.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[name]").forEach((el) => {
    if (el instanceof HTMLInputElement && el.type === "checkbox") {
      if (el.checked) formData.set(el.name, "on");
    } else {
      formData.set(el.name, el.value);
    }
  });
  return formData;
}

export function QuickAddFood({
  onCreated,
  onExpandedChange,
}: {
  onCreated: (food: CreatedFood) => void;
  onExpandedChange?: (expanded: boolean) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [adding, setAdding] = useState(false);
  const [isLoggedByUnit, setIsLoggedByUnit] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function open() {
    setAdding(true);
    onExpandedChange?.(true);
  }

  function close() {
    setAdding(false);
    setIsLoggedByUnit(false);
    setError(null);
    onExpandedChange?.(false);
  }

  function save() {
    if (!containerRef.current) return;

    // No real <form> wraps these fields (nesting one inside LogMealForm's form is
    // invalid HTML), so native required/number validation never runs on its own —
    // trigger it manually via the Constraint Validation API before hitting the server.
    const invalidField = containerRef.current.querySelector<HTMLInputElement | HTMLSelectElement>(
      ":invalid",
    );
    if (invalidField) {
      invalidField.reportValidity();
      return;
    }

    const formData = collectFormData(containerRef.current);
    setError(null);
    startTransition(async () => {
      try {
        const food = await createFood(formData);
        close();
        onCreated(food);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to add food");
      }
    });
  }

  return adding ? (
    <div
      ref={containerRef}
      className="flex flex-col gap-2 rounded-xl border border-hairline bg-bg p-3"
    >
      <FoodFields isLoggedByUnit={isLoggedByUnit} />
      <FoodUnitToggleFields
        isLoggedByUnit={isLoggedByUnit}
        onIsLoggedByUnitChange={setIsLoggedByUnit}
      />
      {error && (
        <span className="flex items-start gap-1.5 text-xs text-danger">
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
      <div className="flex gap-2">
        <button
          type="button"
          onClick={close}
          className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="ml-auto rounded-lg bg-sage px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  ) : (
    <button
      type="button"
      onClick={open}
      className="text-xs font-medium text-sage hover:underline"
    >
      + Add new food
    </button>
  );
}
