"use client";

import { useState, useTransition } from "react";
import { saveProfile, calculateAndApplyGoals } from "./actions";
import {
  ACTIVITY_LEVELS,
  ACTIVITY_LEVEL_LABELS,
  WEIGHT_GOAL_TYPES,
  WEIGHT_GOAL_TYPE_LABELS,
} from "@/lib/nutritionGoals";
import type { ActivityLevel, Sex, WeightGoalType } from "@/generated/prisma/enums";

const inputClasses =
  "rounded-xl border border-hairline bg-bg px-3 py-2.5 text-sm text-ink focus:border-sage focus:outline-none";

export function ProfileForm({
  sex,
  birthDate,
  heightCm,
  activityLevel,
  goalType,
  goalRateKgPerWeek,
  proteinPerKg,
  maintenanceCalories,
  canCalculate,
  calculateDisabledReason,
}: {
  sex: Sex | null;
  birthDate: string | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  goalType: WeightGoalType | null;
  goalRateKgPerWeek: number | null;
  proteinPerKg: number | null;
  maintenanceCalories: number | null;
  canCalculate: boolean;
  calculateDisabledReason: string | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [calcError, setCalcError] = useState<string | null>(null);
  const [isCalculating, startCalculating] = useTransition();

  const [selectedGoalType, setSelectedGoalType] = useState<WeightGoalType>(
    goalType ?? "MAINTAIN",
  );

  return (
    <div className="flex max-w-xs flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-sm">
      <form
        action={(formData) => {
          setError(null);
          setSaved(false);
          startTransition(async () => {
            try {
              await saveProfile(formData);
              setSaved(true);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to save profile");
            }
          });
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Sex</label>
          <select name="sex" defaultValue={sex ?? ""} required className={inputClasses}>
            <option value="" disabled>
              Select…
            </option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Birth date</label>
          <input
            name="birthDate"
            type="date"
            defaultValue={birthDate ?? ""}
            required
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Height (cm)</label>
          <input
            name="heightCm"
            type="number"
            step="0.1"
            min="100"
            max="250"
            defaultValue={heightCm ?? ""}
            required
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Activity level</label>
          <select
            name="activityLevel"
            defaultValue={activityLevel ?? ""}
            required
            className={inputClasses}
          >
            <option value="" disabled>
              Select…
            </option>
            {ACTIVITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {ACTIVITY_LEVEL_LABELS[level]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Goal</label>
          <select
            name="goalType"
            defaultValue={goalType ?? ""}
            required
            className={inputClasses}
            onChange={(e) => setSelectedGoalType(e.target.value as WeightGoalType)}
          >
            <option value="" disabled>
              Select…
            </option>
            {WEIGHT_GOAL_TYPES.map((type) => (
              <option key={type} value={type}>
                {WEIGHT_GOAL_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
        {selectedGoalType !== "MAINTAIN" && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-ink-muted">Rate (kg/week)</label>
            <input
              name="goalRateKgPerWeek"
              type="number"
              step="0.1"
              min="0"
              max="2"
              defaultValue={goalRateKgPerWeek ?? ""}
              required
              className={inputClasses}
            />
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-ink-muted">Protein target (g/kg)</label>
          <input
            name="proteinPerKg"
            type="number"
            step="0.1"
            min="0.5"
            max="4"
            defaultValue={proteinPerKg ?? ""}
            required
            className={inputClasses}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-sage px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          Save profile
        </button>
        {saved && !error && <p className="text-xs text-sage">Saved.</p>}
        {error && <p className="text-xs text-danger">{error}</p>}
      </form>

      <div className="flex flex-col gap-1 border-t border-hairline pt-3">
        {maintenanceCalories !== null && (
          <p className="text-xs text-ink-muted">
            Maintenance: ~{Math.round(maintenanceCalories)} kcal/day
          </p>
        )}
        <button
          type="button"
          disabled={!canCalculate || isCalculating}
          onClick={() => {
            setCalcError(null);
            startCalculating(async () => {
              try {
                await calculateAndApplyGoals();
              } catch (e) {
                setCalcError(e instanceof Error ? e.message : "Failed to calculate goals");
              }
            });
          }}
          className="rounded-xl border border-hairline px-3 py-2.5 text-sm font-semibold text-ink disabled:opacity-50"
        >
          Calculate goals
        </button>
        {!canCalculate && calculateDisabledReason && (
          <p className="text-xs text-ink-muted">{calculateDisabledReason}</p>
        )}
        {calcError && <p className="text-xs text-danger">{calcError}</p>}
      </div>
    </div>
  );
}
