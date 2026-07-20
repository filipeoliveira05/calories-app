import { prisma } from "@/lib/prisma";
import { GoalsForm } from "./GoalsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const goals = await prisma.goals.findUnique({ where: { id: 1 } });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Settings</h1>
      <GoalsForm
        dailyCalorieGoal={goals?.dailyCalorieGoal ?? null}
        dailyProteinGoal={goals?.dailyProteinGoal ?? null}
      />
    </div>
  );
}
