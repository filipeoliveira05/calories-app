"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export async function logWeight(formData: FormData) {
  const weightKg = Number(formData.get("weightKg"));
  const dateStr = String(formData.get("date") ?? "");

  if (!Number.isFinite(weightKg) || weightKg <= 0)
    throw new Error("Weight must be a positive number");

  const date = dateStr
    ? new Date(`${dateStr}T00:00:00.000Z`)
    : todayDateOnly();

  await prisma.weightEntry.upsert({
    where: { date },
    create: { date, weightKg },
    update: { weightKg },
  });

  revalidatePath("/weight");
}

export async function deleteWeightEntry(id: string) {
  await prisma.weightEntry.delete({ where: { id } });
  revalidatePath("/weight");
}
