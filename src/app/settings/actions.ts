"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function saveGoals(formData: FormData) {
  const dailyCalorieGoal = Number(formData.get("dailyCalorieGoal"));
  const dailyProteinGoal = Number(formData.get("dailyProteinGoal"));

  if (!Number.isFinite(dailyCalorieGoal) || dailyCalorieGoal <= 0)
    throw new Error("Calorie goal must be a positive number");
  if (!Number.isFinite(dailyProteinGoal) || dailyProteinGoal <= 0)
    throw new Error("Protein goal must be a positive number");

  await prisma.goals.upsert({
    where: { id: 1 },
    create: { id: 1, dailyCalorieGoal, dailyProteinGoal },
    update: { dailyCalorieGoal, dailyProteinGoal },
  });

  revalidatePath("/settings");
  revalidatePath("/");
}
