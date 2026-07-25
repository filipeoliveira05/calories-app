"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { dateOnlyFromParam, dateParam, addDays } from "@/lib/dateOnly";

export function DateNav({
  selectedDate,
  label,
}: {
  selectedDate: string;
  label: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const current = dateOnlyFromParam(selectedDate);
  const today = dateOnlyFromParam(undefined);
  const isToday = dateParam(current) === dateParam(today);

  function goTo(date: Date) {
    const param = dateParam(date);
    router.push(param === dateParam(dateOnlyFromParam(undefined)) ? "/" : `/?date=${param}`);
  }

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
    }
  }

  return (
    <div className="mb-5 flex items-center gap-3 text-sm text-ink-muted">
      <button
        type="button"
        aria-label="Previous day"
        onClick={() => goTo(addDays(current, -1))}
        className="rounded-lg px-2 py-1 hover:bg-surface-raised"
      >
        ←
      </button>
      <div
        role="button"
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openPicker();
          }
        }}
        className="relative flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-surface-raised"
      >
        <span>{label}</span>
        <svg
          viewBox="0 0 20 20"
          className="h-3.5 w-3.5 shrink-0 text-ink-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="4.5" width="14" height="12" rx="1.5" />
          <path d="M3 8h14M6.5 2.5v3M13.5 2.5v3" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          type="date"
          value={selectedDate}
          onChange={(e) => e.target.value && goTo(dateOnlyFromParam(e.target.value))}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Jump to date"
          tabIndex={-1}
        />
      </div>
      <button
        type="button"
        aria-label="Next day"
        onClick={() => goTo(addDays(current, 1))}
        className="rounded-lg px-2 py-1 hover:bg-surface-raised"
      >
        →
      </button>
      {!isToday && (
        <button
          type="button"
          onClick={() => goTo(today)}
          className="rounded-lg px-2 py-1 text-xs font-medium text-sage hover:bg-surface-raised"
        >
          Today
        </button>
      )}
    </div>

  );
}
