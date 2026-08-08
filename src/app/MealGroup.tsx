"use client";

import { useEffect, useState, useTransition } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { MealEntryRow } from "./MealEntryRow";
import { SaveMealAsRecipe } from "./SaveMealAsRecipe";
import { reorderMealEntries } from "./actions";
import { MEAL_TYPE_LABELS } from "@/lib/mealTypes";
import type { MealType } from "@/generated/prisma/enums";

type Entry = {
  id: string;
  foodName: string;
  grams: number;
  quantity: number | null;
  unitLabel: string | null;
  mealType: MealType;
  calories: number;
  protein: number;
};

export function MealGroup({
  mealType,
  entries,
  date,
  selectedIds,
  onToggle,
}: {
  mealType: MealType;
  entries: Entry[];
  date: string;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}) {
  // Ids only, so drag reordering stays snappy without going stale on other edits
  // (e.g. a grams change) — the entry data itself always comes fresh from `entries`.
  const [pendingOrder, setPendingOrder] = useState<string[] | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!pendingOrder) return;
    const currentIds = entries.map((e) => e.id);
    const sameSet =
      currentIds.length === pendingOrder.length &&
      currentIds.every((id) => pendingOrder.includes(id));
    if (!sameSet || currentIds.join(",") === pendingOrder.join(",")) {
      setPendingOrder(null);
    }
  }, [entries, pendingOrder]);

  const displayEntries = pendingOrder
    ? (pendingOrder.map((id) => entries.find((e) => e.id === id)).filter(Boolean) as Entry[])
    : entries;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { delay: 250, tolerance: 8 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const currentIds = displayEntries.map((e) => e.id);
    const oldIndex = currentIds.indexOf(String(active.id));
    const newIndex = currentIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const nextIds = arrayMove(currentIds, oldIndex, newIndex);
    setPendingOrder(nextIds);
    startTransition(() => {
      reorderMealEntries(nextIds);
    });
  }

  const totals = displayEntries.reduce(
    (acc, e) => {
      acc.calories += e.calories;
      acc.protein += e.protein;
      return acc;
    },
    { calories: 0, protein: 0 },
  );

  return (
    <div className="mb-4">
      <div className="ml-3 inline-block rounded-t-lg bg-surface-raised px-3 py-1 text-xs font-semibold text-ink-muted">
        {MEAL_TYPE_LABELS[mealType]}
      </div>
      <div className="rounded-2xl rounded-tl-none bg-surface-raised p-3 shadow-sm">
        <DndContext
          id={`${date}-${mealType}`}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={displayEntries.map((e) => e.id)}
            strategy={verticalListSortingStrategy}
          >
            {displayEntries.map((entry) => (
              <MealEntryRow
                key={entry.id}
                entry={entry}
                selected={selectedIds.has(entry.id)}
                onToggle={onToggle}
              />
            ))}
          </SortableContext>
        </DndContext>
        <div className="flex flex-wrap items-center gap-2 border-t border-hairline pt-2 text-xs text-ink-muted">
          <SaveMealAsRecipe mealType={mealType} date={date} />
          <span className="ml-auto whitespace-nowrap">
            {totals.calories.toFixed(0)} kcal · {totals.protein.toFixed(1)}g protein
          </span>
        </div>
      </div>
    </div>
  );
}
