"use client";

import { useState, useTransition } from "react";
import { saveProfileAndCalculateGoals } from "./actions";
import {
  ACTIVITY_LEVELS,
  ACTIVITY_LEVEL_LABELS,
  WEIGHT_GOAL_TYPES,
  WEIGHT_GOAL_TYPE_LABELS,
} from "@/lib/nutritionGoals";
import type { ActivityLevel, Sex, WeightGoalType } from "@/generated/prisma/enums";

const inputClasses =
  "rounded-xl border border-hairline bg-bg px-3 py-2.5 text-sm text-ink focus:border-sage focus:outline-none";

const FORM_ID = "profile-form";

type SaveState = { status: "idle" } | { status: "calculated" } | { status: "no-weight" };

function ProfileFields({
  sex,
  birthDate,
  heightCm,
  activityLevel,
  goalType,
  goalRateKgPerWeek,
  proteinPerKg,
  maintenanceCalories,
  calorieGoalPreview,
  proteinGoalPreview,
  action,
}: {
  sex: Sex | null;
  birthDate: string | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  goalType: WeightGoalType | null;
  goalRateKgPerWeek: number | null;
  proteinPerKg: number | null;
  maintenanceCalories: number | null;
  calorieGoalPreview: number | null;
  proteinGoalPreview: number | null;
  action: (formData: FormData) => void;
}) {
  const [selectedGoalType, setSelectedGoalType] = useState<WeightGoalType>(
    goalType ?? "MAINTAIN",
  );

  return (
    <form id={FORM_ID} action={action} className="flex flex-col gap-3">
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

      {(maintenanceCalories !== null ||
        calorieGoalPreview !== null ||
        proteinGoalPreview !== null) && (
        <div className="flex flex-col gap-0.5 rounded-xl bg-bg px-3 py-2">
          {maintenanceCalories !== null && (
            <p className="text-xs text-ink-muted">
              Maintenance: ~{Math.round(maintenanceCalories)} kcal/day
            </p>
          )}
          {calorieGoalPreview !== null && (
            <p className="text-xs text-ink-muted">
              Calorie goal: <span className="text-sage">~{Math.round(calorieGoalPreview)} kcal/day</span>
            </p>
          )}
          {proteinGoalPreview !== null && (
            <p className="text-xs text-ink-muted">
              Protein target: <span className="text-terracotta">~{Math.round(proteinGoalPreview)} g/day</span>
            </p>
          )}
        </div>
      )}
    </form>
  );
}

export function ProfileForm({
  formVersion,
  sex,
  birthDate,
  heightCm,
  activityLevel,
  goalType,
  goalRateKgPerWeek,
  proteinPerKg,
  maintenanceCalories,
  calorieGoalPreview,
  proteinGoalPreview,
}: {
  formVersion: string;
  sex: Sex | null;
  birthDate: string | null;
  heightCm: number | null;
  activityLevel: ActivityLevel | null;
  goalType: WeightGoalType | null;
  goalRateKgPerWeek: number | null;
  proteinPerKg: number | null;
  maintenanceCalories: number | null;
  calorieGoalPreview: number | null;
  proteinGoalPreview: number | null;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>({ status: "idle" });
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex max-w-xs flex-col gap-3 rounded-2xl bg-surface-raised p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-ink">Calculate goals from your profile</h2>
      <ProfileFields
        key={formVersion}
        sex={sex}
        birthDate={birthDate}
        heightCm={heightCm}
        activityLevel={activityLevel}
        goalType={goalType}
        goalRateKgPerWeek={goalRateKgPerWeek}
        proteinPerKg={proteinPerKg}
        maintenanceCalories={maintenanceCalories}
        calorieGoalPreview={calorieGoalPreview}
        proteinGoalPreview={proteinGoalPreview}
        action={(formData) => {
          setError(null);
          setSaveState({ status: "idle" });
          startTransition(async () => {
            try {
              const result = await saveProfileAndCalculateGoals(formData);
              setSaveState({ status: result.calculated ? "calculated" : "no-weight" });
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed to save profile");
            }
          });
        }}
      />
      <button
        type="submit"
        form={FORM_ID}
        disabled={isPending}
        className="rounded-xl bg-sage px-3 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        Save & calculate goals
      </button>
      {saveState.status === "calculated" && !error && (
        <p className="text-xs text-sage">Saved.</p>
      )}
      {saveState.status === "no-weight" && !error && (
        <p className="text-xs text-ink-muted">
          Profile saved. Log a weigh-in to calculate your goals.
        </p>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
