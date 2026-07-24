"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getLatestWeeklyAverageWeight } from "@/lib/weeks";
import { ACTIVITY_LEVELS, WEIGHT_GOAL_TYPES, calculateGoals } from "@/lib/nutritionGoals";
import type { ActivityLevel, Sex, WeightGoalType } from "@/generated/prisma/enums";

function parseProfileForm(formData: FormData) {
  const sex = String(formData.get("sex") ?? "") as Sex;
  const birthDateRaw = String(formData.get("birthDate") ?? "");
  const heightCm = Number(formData.get("heightCm"));
  const activityLevel = String(formData.get("activityLevel") ?? "") as ActivityLevel;
  const goalType = String(formData.get("goalType") ?? "") as WeightGoalType;
  const goalRateKgPerWeek =
    goalType === "MAINTAIN" ? 0 : Number(formData.get("goalRateKgPerWeek"));
  const proteinPerKg = Number(formData.get("proteinPerKg"));

  if (sex !== "MALE" && sex !== "FEMALE") throw new Error("Sex is required");
  const birthDate = new Date(birthDateRaw);
  if (!birthDateRaw || Number.isNaN(birthDate.getTime()))
    throw new Error("Birth date is required");
  if (!Number.isFinite(heightCm) || heightCm < 100 || heightCm > 250)
    throw new Error("Height must be between 100 and 250 cm");
  if (!ACTIVITY_LEVELS.includes(activityLevel))
    throw new Error("Invalid activity level");
  if (!WEIGHT_GOAL_TYPES.includes(goalType)) throw new Error("Invalid goal type");
  if (!Number.isFinite(goalRateKgPerWeek) || goalRateKgPerWeek < 0 || goalRateKgPerWeek > 2)
    throw new Error("Rate must be between 0 and 2 kg/week");
  if (!Number.isFinite(proteinPerKg) || proteinPerKg < 0.5 || proteinPerKg > 4)
    throw new Error("Protein target must be between 0.5 and 4 g/kg");

  return { sex, birthDate, heightCm, activityLevel, goalType, goalRateKgPerWeek, proteinPerKg };
}

export async function saveProfile(formData: FormData) {
  const data = parseProfileForm(formData);

  await prisma.goals.upsert({
    where: { id: 1 },
    create: { id: 1, dailyCalorieGoal: 0, dailyProteinGoal: 0, ...data },
    update: data,
  });

  revalidatePath("/settings");
}

export async function calculateAndApplyGoals() {
  const goals = await prisma.goals.findUnique({ where: { id: 1 } });
  if (
    !goals ||
    !goals.sex ||
    !goals.birthDate ||
    !goals.heightCm ||
    !goals.activityLevel ||
    !goals.goalType ||
    goals.goalRateKgPerWeek === null ||
    !goals.proteinPerKg
  ) {
    throw new Error("Fill in your profile above to calculate goals");
  }

  const weightEntries = await prisma.weightEntry.findMany({
    orderBy: { date: "asc" },
  });
  const weightKg = getLatestWeeklyAverageWeight(
    weightEntries.map((e) => ({ date: e.date, weightKg: e.weightKg })),
  );
  if (weightKg === null) throw new Error("Log a weigh-in first to calculate goals");

  const { calorieGoal, proteinGoal } = calculateGoals({
    sex: goals.sex,
    birthDate: goals.birthDate,
    heightCm: goals.heightCm,
    activityLevel: goals.activityLevel,
    goalType: goals.goalType,
    goalRateKgPerWeek: goals.goalRateKgPerWeek,
    proteinPerKg: goals.proteinPerKg,
    weightKg,
  });

  await prisma.goals.update({
    where: { id: 1 },
    data: {
      dailyCalorieGoal: Math.round(calorieGoal),
      dailyProteinGoal: Math.round(proteinGoal),
    },
  });

  revalidatePath("/settings");
  revalidatePath("/");
}

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
