import { prisma } from "@/lib/prisma";
import { getLatestWeeklyAverageWeight } from "@/lib/weeks";
import { calculateGoals } from "@/lib/nutritionGoals";
import { GoalsForm } from "./GoalsForm";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [goals, weightEntries] = await Promise.all([
    prisma.goals.findUnique({ where: { id: 1 } }),
    prisma.weightEntry.findMany({ orderBy: { date: "asc" } }),
  ]);

  const weightKg = getLatestWeeklyAverageWeight(
    weightEntries.map((e) => ({ date: e.date, weightKg: e.weightKg })),
  );

  const profileComplete = Boolean(
    goals?.sex &&
      goals?.birthDate &&
      goals?.heightCm &&
      goals?.activityLevel &&
      goals?.goalType &&
      goals?.goalRateKgPerWeek !== null &&
      goals?.proteinPerKg,
  );

  const maintenanceCalories =
    profileComplete && weightKg !== null
      ? calculateGoals({
          sex: goals!.sex!,
          birthDate: goals!.birthDate!,
          heightCm: goals!.heightCm!,
          activityLevel: goals!.activityLevel!,
          goalType: goals!.goalType!,
          goalRateKgPerWeek: goals!.goalRateKgPerWeek!,
          proteinPerKg: goals!.proteinPerKg!,
          weightKg,
        }).maintenanceCalories
      : null;

  const canCalculate = profileComplete && weightKg !== null;
  const calculateDisabledReason = !profileComplete
    ? "Fill in your profile above to calculate goals."
    : weightKg === null
      ? "Log a weigh-in first to calculate goals."
      : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="mb-1 font-display text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-ink-muted">
          Your profile and daily calorie and protein targets.
        </p>
      </div>
      <ProfileForm
        sex={goals?.sex ?? null}
        birthDate={goals?.birthDate ? goals.birthDate.toISOString().slice(0, 10) : null}
        heightCm={goals?.heightCm ?? null}
        activityLevel={goals?.activityLevel ?? null}
        goalType={goals?.goalType ?? null}
        goalRateKgPerWeek={goals?.goalRateKgPerWeek ?? null}
        proteinPerKg={goals?.proteinPerKg ?? null}
        maintenanceCalories={maintenanceCalories}
        canCalculate={canCalculate}
        calculateDisabledReason={calculateDisabledReason}
      />
      <GoalsForm
        dailyCalorieGoal={goals?.dailyCalorieGoal ?? null}
        dailyProteinGoal={goals?.dailyProteinGoal ?? null}
      />
    </div>
  );
}
