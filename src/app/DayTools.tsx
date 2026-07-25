"use client";

import { useState, useTransition } from "react";
import { applyDayTemplate, saveDayAsTemplate, clearDay } from "./actions";

type Template = { id: string; name: string };

export function DayTools({
  templates,
  date,
  entryCount,
}: {
  templates: Template[];
  date: string;
  entryCount: number;
}) {
  const [templateId, setTemplateId] = useState("");
  const [savingAs, setSavingAs] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function applyTemplate() {
    if (!templateId) return;
    if (
      entryCount > 0 &&
      !confirm(
        `You already have ${entryCount} meal${entryCount === 1 ? "" : "s"} logged this day — add this template's meals on top anyway?`,
      )
    )
      return;

    setError(null);
    const formData = new FormData();
    formData.set("templateId", templateId);
    formData.set("date", date);
    startTransition(async () => {
      try {
        await applyDayTemplate(formData);
        setTemplateId("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to apply template");
      }
    });
  }

  function saveAsTemplate() {
    if (!templateName.trim()) return;
    setError(null);
    const formData = new FormData();
    formData.set("name", templateName.trim());
    formData.set("date", date);
    startTransition(async () => {
      try {
        await saveDayAsTemplate(formData);
        setSavingAs(false);
        setTemplateName("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to save template");
      }
    });
  }

  function clear() {
    if (!confirm(`Clear all ${entryCount} meal${entryCount === 1 ? "" : "s"} logged this day?`))
      return;
    setError(null);
    const formData = new FormData();
    formData.set("date", date);
    startTransition(() => clearDay(formData));
  }

  return (
    <div className="mb-5 flex flex-col gap-2 text-sm">
      {templates.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-hairline bg-bg px-2.5 py-2 text-sm text-ink focus:border-sage focus:outline-none"
          >
            <option value="">Apply a day template…</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={applyTemplate}
            disabled={!templateId || isPending}
            className="shrink-0 rounded-xl bg-sage px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
          >
            Apply
          </button>
        </div>
      )}

      {entryCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {savingAs ? (
            <>
              <input
                autoFocus
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name"
                className="min-w-0 flex-1 rounded-lg border border-hairline bg-bg px-2 py-1 text-xs text-ink focus:border-sage focus:outline-none"
              />
              <button
                type="button"
                onClick={saveAsTemplate}
                disabled={!templateName.trim() || isPending}
                className="rounded-lg bg-sage px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setSavingAs(false);
                  setTemplateName("");
                }}
                className="rounded-lg px-2 py-1 text-xs font-medium text-ink-muted"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSavingAs(true)}
              className="rounded-lg px-2 py-1 text-xs font-medium text-sage hover:bg-sage-soft"
            >
              Save this day as a template
            </button>
          )}
          <button
            type="button"
            onClick={clear}
            disabled={isPending}
            className="ml-auto rounded-lg px-2 py-1 text-xs font-medium text-danger hover:bg-terracotta-soft disabled:opacity-50"
          >
            Clear day
          </button>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
