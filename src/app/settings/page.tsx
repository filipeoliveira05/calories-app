import { prisma } from "@/lib/prisma";
import { GoalsForm } from "./GoalsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const goals = await prisma.goals.findUnique({ where: { id: 1 } });

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-semibold">Settings</h1>
      <p className="mb-5 text-sm text-ink-muted">Your daily calorie and protein targets.</p>
      <GoalsForm
        dailyCalorieGoal={goals?.dailyCalorieGoal ?? null}
        dailyProteinGoal={goals?.dailyProteinGoal ?? null}
      />
    </div>
  );
}
