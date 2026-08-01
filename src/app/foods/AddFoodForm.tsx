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
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [unitLabel, setUnitLabel] = useState("");
  const [gramsPerUnit, setGramsPerUnit] = useState("");

  const isFilled =
    name.trim() !== "" &&
    calories.trim() !== "" &&
    protein.trim() !== "" &&
    (!isLoggedByUnit || (unitLabel.trim() !== "" && gramsPerUnit.trim() !== ""));
  const hasAnyInput =
    name !== "" ||
    calories !== "" ||
    protein !== "" ||
    isLoggedByUnit ||
    unitLabel !== "" ||
    gramsPerUnit !== "";

  function resetForm() {
    formRef.current?.reset();
    setIsLoggedByUnit(false);
    setName("");
    setCalories("");
    setProtein("");
    setUnitLabel("");
    setGramsPerUnit("");
  }

  return (
    <form
      ref={formRef}
      action={(formData) => {
        setError(null);
        setSuccess(null);
        startTransition(async () => {
          try {
            const submittedName = formData.get("name");
            await createFood(formData);
            resetForm();
            setSuccess(
              typeof submittedName === "string" && submittedName
                ? `"${submittedName}" added`
                : "Food added"
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to add food");
          }
        });
      }}
      className="mb-5 grid grid-cols-[1fr_1fr_1fr_auto] grid-rows-2 gap-2 rounded-2xl bg-surface-raised p-4 shadow-sm sm:grid-cols-[1fr_6.5rem_4.5rem_4.5rem_auto] sm:grid-rows-none sm:items-end"
    >
      <FoodFields
        isLoggedByUnit={isLoggedByUnit}
        onNameChange={setName}
        onCaloriesChange={setCalories}
        onProteinChange={setProtein}
      />
      <button
        type="submit"
        disabled={isPending || !isFilled}
        className="col-start-4 row-span-2 mt-5 flex items-center justify-center rounded-xl bg-sage px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:col-auto sm:row-auto sm:mt-0"
      >
        Add
      </button>

      <FoodUnitToggleFields
        isLoggedByUnit={isLoggedByUnit}
        onIsLoggedByUnitChange={setIsLoggedByUnit}
        onUnitLabelChange={setUnitLabel}
        onGramsPerUnitChange={setGramsPerUnit}
        className="col-span-4 mt-1 sm:col-span-5"
      />

      {hasAnyInput && (
        <button
          type="button"
          onClick={resetForm}
          className="col-span-4 w-fit rounded-xl px-3 py-2.5 text-sm font-medium text-danger hover:bg-terracotta-soft sm:col-span-5"
        >
          Cancel
        </button>
      )}

      {error && (
        <span className="col-span-4 flex items-start gap-1.5 text-xs text-danger sm:col-span-5">
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
        <span className="col-span-4 flex items-start gap-1.5 text-xs text-sage sm:col-span-5">
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
