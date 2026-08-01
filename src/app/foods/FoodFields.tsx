"use client";

import { FOOD_CATEGORIES, FOOD_CATEGORY_LABELS } from "@/lib/foodCategories";

const inputClasses =
  "w-full rounded-xl border border-hairline bg-bg px-2.5 py-2 text-sm text-ink focus:border-sage focus:outline-none";

export function FoodFields({
  isLoggedByUnit,
  onNameChange,
  onCaloriesChange,
  onProteinChange,
}: {
  isLoggedByUnit: boolean;
  onNameChange?: (value: string) => void;
  onCaloriesChange?: (value: string) => void;
  onProteinChange?: (value: string) => void;
}) {
  return (
    <>
      <div className="col-span-3 row-start-1 flex flex-col gap-1 sm:col-auto sm:row-auto">
        <label className="text-xs text-ink-muted">Food name</label>
        <input
          name="name"
          placeholder="e.g. Rice"
          required
          onChange={(e) => onNameChange?.(e.target.value)}
          className={inputClasses}
        />
      </div>
      <div className="col-start-1 row-start-2 flex flex-col gap-1 sm:col-auto sm:row-auto">
        <label className="text-xs text-ink-muted">Category</label>
        <select
          name="category"
          defaultValue={FOOD_CATEGORIES[0]}
          className={`min-w-0 ${inputClasses}`}
        >
          {FOOD_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {FOOD_CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </div>
      <div className="col-start-2 row-start-2 flex flex-col gap-1 sm:col-auto sm:row-auto">
        <label className="text-xs text-ink-muted">
          {isLoggedByUnit ? "kcal/unit" : "kcal/100g"}
        </label>
        <input
          name="caloriesPer100g"
          type="number"
          step="0.1"
          min="0"
          required
          onChange={(e) => onCaloriesChange?.(e.target.value)}
          className={`min-w-0 ${inputClasses}`}
        />
      </div>
      <div className="col-start-3 row-start-2 flex flex-col gap-1 sm:col-auto sm:row-auto">
        <label className="text-xs text-ink-muted">
          {isLoggedByUnit ? "protein/unit" : "protein/100g"}
        </label>
        <input
          name="proteinPer100g"
          type="number"
          step="0.1"
          min="0"
          required
          onChange={(e) => onProteinChange?.(e.target.value)}
          className={`min-w-0 ${inputClasses}`}
        />
      </div>
    </>
  );
}

export function FoodUnitToggleFields({
  isLoggedByUnit,
  onIsLoggedByUnitChange,
  onUnitLabelChange,
  onGramsPerUnitChange,
  className = "",
}: {
  isLoggedByUnit: boolean;
  onIsLoggedByUnitChange: (value: boolean) => void;
  onUnitLabelChange?: (value: string) => void;
  onGramsPerUnitChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <>
      <label className={`inline-flex w-fit items-center gap-2 text-xs text-ink-muted ${className}`}>
        <input
          type="checkbox"
          name="isLoggedByUnit"
          checked={isLoggedByUnit}
          onChange={(e) => onIsLoggedByUnitChange(e.target.checked)}
          className="accent-sage"
        />
        Logged by unit (e.g. &ldquo;1 yogurt&rdquo; instead of grams)
      </label>

      {isLoggedByUnit && (
        <div className={`grid grid-cols-2 gap-2 ${className}`}>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted">Unit name</label>
            <input
              name="unitLabel"
              placeholder="e.g. yogurt"
              required={isLoggedByUnit}
              onChange={(e) => onUnitLabelChange?.(e.target.value)}
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted">Grams/unit</label>
            <input
              name="gramsPerUnit"
              type="number"
              step="0.1"
              min="0"
              required={isLoggedByUnit}
              onChange={(e) => onGramsPerUnitChange?.(e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      )}
    </>
  );
}
